"use client";

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Briefcase,
  MapPin,
  Trash2,
  Check,
  Navigation,
  Plus,
  Lock,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './addresses.module.css';

const ADDRESS_TYPES = ['Home', 'Office', 'Other'];

export default function AddressesPage() {
  const navigate = useNavigate();
  const {
    addresses,
    activeAddress,
    saveAddress,
    deleteAddress,
    setActiveAddressById,
  } = useContext(AuthContext);

  // Form States
  const [addressType, setAddressType] = useState('Home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const isTypingRef = useRef(false);

  // Fetch available cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const shops = await api.getShops();
        const activeShops = shops.filter(s => s.is_active);
        const cities = [...new Set(activeShops.map(s => s.city))];
        setAvailableCities(cities);
        if (activeShops.length > 0) {
          setActiveShop(activeShops[0]);
          if (!city) setCity(activeShops[0].city);
        }
      } catch (err) {
        console.error('Error fetching shops/cities:', err);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    if (!city && activeShop) {
      setCity(activeShop.city);
    }
  }, [activeShop, city]);

  // Populate form when addressType changes
  useEffect(() => {
    const existing = addresses.find(addr => addr.type === addressType);
    if (existing) {
      setReceiverName(existing.receiverName || '');
      setReceiverMobile(existing.receiverMobile || '');
      setFlatNo(existing.flatNo || '');
      setAddressLine(existing.addressLine || '');
      setLandmark(existing.landmark || '');
      setCity(existing.city || '');
      setLatitude(existing.latitude || null);
      setLongitude(existing.longitude || null);
      setEditingAddressId(existing.id);
    } else {
      clearForm();
      if (activeAddress) {
        setFlatNo(activeAddress.flatNo || '');
        setAddressLine(activeAddress.addressLine || '');
        setLandmark(activeAddress.landmark || '');
        setCity(activeAddress.city || '');
        setLatitude(activeAddress.latitude || null);
        setLongitude(activeAddress.longitude || null);
      }
    }
  }, [addressType, addresses, availableCities, activeAddress]);

  // Sync addressType with activeAddress selection
  useEffect(() => {
    if (activeAddress && activeAddress.type) {
      setAddressType(activeAddress.type);
    } else {
      setAddressType('Home');
    }
  }, [activeAddress]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (!mapRef.current || leafletMapRef.current || !activeShop) return;

      const centerLat = Number(activeShop.latitude) || 28.6139;
      const centerLng = Number(activeShop.longitude) || 77.2090;
      const radiusKm = Number(activeShop.delivery_radius_km) || 15;

      const latDegreeDiff = radiusKm / 111;
      const lngDegreeDiff = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

      const minLat = centerLat - latDegreeDiff;
      const maxLat = centerLat + latDegreeDiff;
      const minLng = centerLng - lngDegreeDiff;
      const maxLng = centerLng + lngDegreeDiff;

      const bounds = L.latLngBounds(
        L.latLng(minLat, minLng),
        L.latLng(maxLat, maxLng)
      );

      const map = L.map(mapRef.current, { 
        zoomControl: true,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0 
      });
      map.fitBounds(bounds);
      map.setMinZoom(map.getZoom());

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.circle([centerLat, centerLng], {
        color: '#16a34a',
        weight: 1.5,
        opacity: 0.4,
        fillColor: '#16a34a',
        fillOpacity: 0.08,
        radius: radiusKm * 1000
      }).addTo(map);

      const marker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
      marker.on('dragend', (e) => {
        const coords = e.target.getLatLng();
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        reverseGeocode(coords.lat, coords.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      // Set initial position from existing address, or activeAddress, or fallback to center
      const existing = addresses.find(a => a.type === addressType);
      if (existing?.latitude && existing?.longitude) {
        const extLat = Number(existing.latitude);
        const extLng = Number(existing.longitude);
        map.setView([extLat, extLng], 17);
        marker.setLatLng([extLat, extLng]);
        setLatitude(extLat);
        setLongitude(extLng);
      } else if (activeAddress?.latitude && activeAddress?.longitude) {
        const actLat = Number(activeAddress.latitude);
        const actLng = Number(activeAddress.longitude);
        map.setView([actLat, actLng], 17);
        marker.setLatLng([actLat, actLng]);
        setLatitude(actLat);
        setLongitude(actLng);
      } else {
        setLatitude(centerLat);
        setLongitude(centerLng);
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      }
    };
  }, [activeShop, addresses, addressType, activeAddress]);

  // Update map when lat/lng changes
  useEffect(() => {
    if (mapReady && leafletMapRef.current && markerRef.current && latitude && longitude) {
      leafletMapRef.current.setView([latitude, longitude], 16);
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, mapReady]);

  // Automatically point map to the city when user changes city
  // Commented out to prevent overwriting existing address coordinates on mount.
  // The map already centers on the activeShop's coordinates if no address exists.
  /*
  useEffect(() => {
    if (!city) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city.trim())}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const best = data[0];
            const lat = Number(best.lat);
            const lng = Number(best.lon);
            setLatitude(lat);
            setLongitude(lng);
            
            if (leafletMapRef.current && markerRef.current) {
              leafletMapRef.current.setView([lat, lng], 12);
              markerRef.current.setLatLng([lat, lng]);
            }
          }
        }
      } catch (e) {
        console.error('City geocoding failed:', e);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [city]);
  */

  // Refined search when user enters area/colony/sector
  useEffect(() => {
    if (!addressLine.trim() || !city.trim()) return;
    if (!isTypingRef.current) return; // Skip if change was from map drag/click or loading a saved address

    const timeoutId = setTimeout(async () => {
      try {
        const query = `${addressLine.trim()}, ${city.trim()}`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const best = data[0];
            const lat = Number(best.lat);
            const lng = Number(best.lon);
            
            // Temporarily disable typing flag so the lat/lng state sync doesn't cause loop issues
            isTypingRef.current = false;
            setLatitude(lat);
            setLongitude(lng);
            
            if (leafletMapRef.current && markerRef.current) {
              leafletMapRef.current.setView([lat, lng], 15);
              markerRef.current.setLatLng([lat, lng]);
            }
          }
        }
      } catch (e) {
        console.error('Area geocoding failed, staying on city:', e);
      } finally {
        isTypingRef.current = false;
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [addressLine]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
          const landmarkVal = addr.suburb || addr.city_district || addr.city || '';
          
          setAddressLine(prev => prev || road);
          setLandmark(prev => prev || landmarkVal);
        }
      }
    } catch (e) {
      console.error('Reverse geocoding failed:', e);
    }
  };

  const clearForm = () => {
    setReceiverName('');
    setReceiverMobile('');
    setFlatNo('');
    setAddressLine('');
    setLandmark('');
    setCity('');
    setLatitude(null);
    setLongitude(null);
    setEditingAddressId(null);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (activeShop) {
          const centerLat = Number(activeShop.latitude) || 28.6139;
          const centerLng = Number(activeShop.longitude) || 77.2090;
          const radiusKm = Number(activeShop.delivery_radius_km) || 15;
          const latDegreeDiff = radiusKm / 111;
          const lngDegreeDiff = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));
          const minLat = centerLat - latDegreeDiff;
          const maxLat = centerLat + latDegreeDiff;
          const minLng = centerLng - lngDegreeDiff;
          const maxLng = centerLng + lngDegreeDiff;

          if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
            alert('We are not available in this location currently.');
            return;
          }
        }

        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
      },
      (err) => {
        alert('Failed to get current location. Please allow location access.');
      }
    );
  };

  const handleSave = async () => {
    if (!receiverName.trim() || !receiverMobile.trim() || !flatNo.trim() || !addressLine.trim() || !landmark.trim() || !city.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    if (receiverMobile.trim().length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSaving(true);

    const payload = {
      id: editingAddressId || undefined,
      type: addressType,
      receiverName: receiverName.trim(),
      receiverMobile: receiverMobile.trim(),
      flatNo: flatNo.trim(),
      addressLine: addressLine.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      latitude: latitude || 28.6139,
      longitude: longitude || 77.2090,
    };

    try {
      await saveAddress(payload);
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setIsSaving(false);
      navigate('/');
    }
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
    }
  };

  const handleSetActive = (id) => {
    setActiveAddressById(id);
    navigate('/');
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'Home': return <Home size={18} />;
      case 'Office':
      case 'Work': return <Briefcase size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const isFormValid = receiverName.trim() && receiverMobile.trim().length >= 10 && flatNo.trim() && addressLine.trim() && landmark.trim() && city.trim();

  return (
    <div className={styles.addressPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Manage Addresses</h1>
      </div>

      <div className={styles.pageContent}>
        {/* Saved Addresses */}
        {addresses.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Saved Addresses</h3>
            <div className={styles.addressList}>
              {addresses.map((item) => {
                const isActive = activeAddress && activeAddress.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`${styles.addressCard} ${isActive ? styles.addressCardActive : ''}`}
                    onClick={() => handleSetActive(item.id)}
                  >
                    <div className={styles.addressLeft}>
                      <div className={styles.addressIconWrap}>
                        {getAddressIcon(item.type)}
                      </div>
                      <div className={styles.addressInfo}>
                        <span className={styles.addressType}>
                          {item.type} {isActive && <span className={styles.activeBadge}>(Active)</span>}
                        </span>
                        {item.receiverName && item.receiverMobile && (
                          <span className={styles.addressReceiver}>
                            {item.receiverName} • {item.receiverMobile}
                          </span>
                        )}
                        <span className={styles.addressDetail}>
                          {item.flatNo}, {item.addressLine}. Landmark: {item.landmark}. City: {item.city || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.addressActions}>
                      {isActive && <Check size={18} className={styles.checkIcon} />}
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(item.id); }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {editingAddressId ? `Edit ${addressType} Address` : `Add New Address`}
          </h3>

          <div className={styles.formCard}>
            <div className={styles.formLayout}>
              <div className={styles.formFieldsCol}>
                {/* Type Pills */}
                <div className={styles.typePillRow}>
                  {ADDRESS_TYPES.map((type) => (
                    <button
                      key={type}
                      className={`${styles.typePill} ${addressType === type ? styles.typePillActive : ''}`}
                      onClick={() => setAddressType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Receiver's Full Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. John Doe"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Receiver's Mobile Number *</label>
                    <input
                      type="tel"
                      className={styles.formInput}
                      placeholder="10-digit mobile number"
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={10}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery City *</label>
                    <div className={styles.pickerSelector}>
                      <span className={styles.pickerSelectorText}>
                        {city || (activeShop ? activeShop.city : 'Loading...')}
                      </span>
                      <Lock size={16} color="#9CA3AF" />
                    </div>
                    <span className={styles.cityWarningText}>
                      * We only deliver to this city currently.
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Area / Colony / Sector *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Bapu Nagar"
                      value={addressLine}
                      onChange={(e) => { isTypingRef.current = true; setAddressLine(e.target.value); }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>House No. / Building / Floor *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Flat 101, A-Wing"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nearby Landmark</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Near City Mall"
                      value={landmark}
                      onChange={(e) => { isTypingRef.current = true; setLandmark(e.target.value); }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.mapCol}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginTop: '10px', marginBottom: '10px' }}>Select your exact delivery location *</h3>
                <button className={styles.currentLocationBtn} onClick={handleCurrentLocation}>
                  <Navigation size={14} />
                  <span>Use Current Location</span>
                </button>
                <div className={styles.mapContainer}>
                  <div ref={mapRef} className={styles.mapView} />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
