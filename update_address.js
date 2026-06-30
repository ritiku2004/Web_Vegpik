const fs = require('fs');
const file = 'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/addresses/page.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import\s*\{([\s\S]*?)\}\s*from\s*'lucide-react';/, (m, p1) => m.replace(p1, p1 + '  Lock,\n'));
content = content.replace(/const \[availableCities, setAvailableCities\] = useState\(\[\]\);/, 'const [availableCities, setAvailableCities] = useState([]);\n  const [activeShop, setActiveShop] = useState(null);');

const oldLoadCities = /const loadCities = async \(\) => \{[\s\S]*?loadCities\(\);\n  \}, \[\]\);/;
const newLoadCities = `const loadCities = async () => {
      try {
        const shops = await api.getShops();
        const activeShops = shops.filter(s => s.is_active);
        const cities = [...new Set(activeShops.map(s => s.city))];
        setAvailableCities(cities);
        if (activeShops.length > 0) {
          setActiveShop(activeShops[0]);
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
  }, [activeShop, city]);`;

content = content.replace(oldLoadCities, newLoadCities);

const oldMapInit = /loadLeaflet\(\)\.then\(\(L\) => \{[\s\S]*?\}\);/;
const newMapInit = `loadLeaflet().then((L) => {
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

      const existing = addresses.find(a => a.type === addressType);
      if (existing?.latitude && existing?.longitude) {
        map.setView([existing.latitude, existing.longitude], 17);
        marker.setLatLng([existing.latitude, existing.longitude]);
      } else {
        setLatitude(centerLat);
        setLongitude(centerLng);
      }
    });`;

content = content.replace(oldMapInit, newMapInit);
content = content.replace(/\[\]\);/g, (m, offset) => {
  // Update dependencies for map init
  if (content.substring(offset - 200, offset).includes('loadLeaflet')) {
    return '[activeShop, addresses, addressType]);';
  }
  return m;
});


const oldGeoLogic = /const handleCurrentLocation = \(\) => \{[\s\S]*?\}\);\n  \};/;
const newGeoLogic = `const handleCurrentLocation = () => {
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
  };`;

content = content.replace(oldGeoLogic, newGeoLogic);

const oldCitySelect = /<div className=\{styles\.formGroup\}>\s*<label className=\{styles\.formLabel\}>Delivery City \*<\/label>[\s\S]*?<\/select>\s*<\/div>/;
const newCitySelect = `<div className={styles.formGroup}>
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
                  </div>`;

content = content.replace(oldCitySelect, newCitySelect);

fs.writeFileSync(file, content, 'utf8');
console.log("Success");
