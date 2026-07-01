import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import apiClient from '../../services/api';
import styles from './Profile.module.css';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';

const PRESET_AVATARS = [
  { emoji: '🍅', color: '#FEE2E2', label: 'Tomato' },
  { emoji: '🥦', color: '#D1FAE5', label: 'Broccoli' },
  { emoji: '🥕', color: '#FFEDD5', label: 'Carrot' },
  { emoji: '🥑', color: '#E0F2FE', label: 'Avocado' },
  { emoji: '🍓', color: '#FFF1F2', label: 'Strawberry' },
  { emoji: '🍋', color: '#FEF9C3', label: 'Lemon' },
  { emoji: '🍇', color: '#F3E8FF', label: 'Grapes' },
  { emoji: '🍉', color: '#ECFDF5', label: 'Watermelon' },
  { emoji: '🍎', color: '#FEF2F2', label: 'Apple' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, addresses, activeAddress, saveAddress, deleteAddress, setActiveAddress } = useGlobalState();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit profile form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Address form fields
  const [addrTitle, setAddrTitle] = useState('Home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [city, setCity] = useState('Kurnool');
  const [area, setArea] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const getAvatarColor = (url) => {
    if (!url) return '#FEE2E2'; // Default light pink background
    const match = PRESET_AVATARS.find(a => a.emoji === url);
    return match ? match.color : '#F1F5F9'; // Custom image gets light grey background
  };

  const ProfileAvatar = ({ url, firstName, isCircle = true }) => {
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
      setImgFailed(false);
    }, [url]);

    if (!url || imgFailed) {
      return (
        <div className={isCircle ? styles.avatarPlaceholder : styles.modalAvatarPlaceholder}>
          {firstName ? firstName[0].toUpperCase() : 'U'}
        </div>
      );
    }

    const isEmoji = !url.includes('/') && !url.includes('.');
    if (isEmoji) {
      return <span style={{ fontSize: isCircle ? '2.5rem' : '3.5rem', display: 'block', lineHeight: 1 }}>{url}</span>;
    }

    let fullUrl = url;
    if (url.includes('media.vegpik.com')) {
      const parts = url.split('media.vegpik.com');
      const pathAfterDomain = parts[parts.length - 1]; // e.g. "/users/avatar-..." or "/products/..."
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');
      fullUrl = `${baseUrl}/uploads${pathAfterDomain}`;
    } else {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');
      fullUrl = url.startsWith('http') ? url : `${baseUrl}/${url}`;
    }
    return (
      <img 
        src={fullUrl} 
        alt="Profile" 
        className={isCircle ? styles.avatarImg : styles.modalAvatarImg} 
        onError={() => setImgFailed(true)}
      />
    );
  };

  // Initialize edit fields
  useEffect(() => {
    if (user) {
      setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
      setAvatar(user.profile_picture_url || '');
    }
  }, [user]);

  // Fetch orders from backend
  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const response = await apiClient.get('/user/orders');
      if (response && response.data) {
        setOrders(response.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!name) {
      setEditError('Name is required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const response = await apiClient.put('/user/auth/profile', {
        name,
        email,
        phone_number: phone,
        profile_picture_url: avatar
      });
      if (response && response.data) {
        // Update user details in context & localStorage
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...savedUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Quick sync
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!flatNo || !area || !receiverName || !receiverMobile) {
      alert('Please fill all required fields.');
      return;
    }
    const payload = {
      title: addrTitle,
      address_line1: `${flatNo}||${area}`,
      address_line2: landmark,
      city,
      state: 'Andhra Pradesh',
      latitude: null,
      longitude: null,
      is_default: isDefault,
      receiver_name: receiverName,
      receiver_mobile: receiverMobile
    };
    await saveAddress(payload);
    setReceiverName('');
    setReceiverMobile('');
    setArea('');
    setFlatNo('');
    setLandmark('');
    setIsDefault(false);
    setShowAddForm(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  // Redirect to login if user accesses profile page while logged out
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser && !user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className={styles.profileContainer}>
      
      <SubPageHeader title="My Profile" />

      {/* ─── PROFILE CONTENT CONTAINER ─── */}
      <div className={styles.profileContent}>
        
        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle} style={{ backgroundColor: getAvatarColor(user.profile_picture_url) }}>
              <ProfileAvatar url={user.profile_picture_url} firstName={user.first_name} isCircle={true} />
              {/* Small camera edit overlay */}
              <label className={styles.cameraOverlay} htmlFor="avatarUpload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </label>
              <input 
                type="file" 
                id="avatarUpload" 
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const formData = new FormData();
                    formData.append('avatar', e.target.files[0]);
                    try {
                      const response = await apiClient.post('/user/auth/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      if (response && response.data) {
                        window.location.reload();
                      }
                    } catch (err) {
                      alert('Failed to upload profile picture.');
                    }
                  }
                }}
              />
            </div>
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>{user.first_name} {user.last_name || ''}</h2>
              <p className={styles.userMeta}>{user.email}</p>
              {user.phone_number && <p className={styles.userMeta}>{user.phone_number}</p>}
            </div>
          </div>
          <button className={styles.editBtn} onClick={() => setShowEditModal(true)} aria-label="Edit Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>

        {/* Menu Card Options */}
        <div className={styles.menuCard}>
          {/* Order History */}
          <div className={styles.menuRow} onClick={() => navigate('/order-again')}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span className={styles.rowLabel}>Order History</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Address Book */}
          <div className={styles.menuRow} onClick={() => navigate(ROUTES.ADDRESS_BOOK)}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span className={styles.rowLabel}>Address Book</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Share App */}
          <div className={styles.menuRow} onClick={() => alert('Share Link: https://vegpik.com')}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <span className={styles.rowLabel}>Share App</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* About Us */}
          <div className={styles.menuRow} onClick={() => navigate(ROUTES.ABOUT)}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <span className={styles.rowLabel}>About Us</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Contact Us */}
          <div className={styles.menuRow} onClick={() => navigate(ROUTES.CONTACT)}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <span className={styles.rowLabel}>Contact Us</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Privacy Policy */}
          <div className={styles.menuRow} onClick={() => navigate(ROUTES.PRIVACY)}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className={styles.rowLabel}>Privacy Policy</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Terms & Conditions */}
          <div className={styles.menuRow} onClick={() => navigate(ROUTES.TERMS)}>
            <div className={styles.menuRowLeft}>
              <div className={styles.rowIconWrapper}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className={styles.rowLabel}>Terms & Conditions</span>
            </div>
            <svg className={styles.rowChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        {/* Log Out Button */}
        <button className={styles.logoutBtn} onClick={handleLogoutClick}>
          Log Out
        </button>
      </div>

      {/* ─── EDIT PROFILE MODAL ─── */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Profile</h3>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditProfile} className={styles.profileForm}>
                {editError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{editError}</p>}
                
                {/* Modal Avatar Selection */}
                <div className={styles.modalAvatarSection}>
                  <div className={styles.modalAvatarCircle} style={{ backgroundColor: getAvatarColor(avatar) }}>
                    <ProfileAvatar url={avatar} firstName={name} isCircle={false} />
                    <label className={styles.cameraOverlay} htmlFor="modalAvatarUpload">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                    </label>
                    <input 
                      type="file" 
                      id="modalAvatarUpload" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const formData = new FormData();
                          formData.append('avatar', e.target.files[0]);
                          try {
                            const response = await apiClient.post('/user/auth/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            if (response && response.data && response.data.url) {
                              setAvatar(response.data.url);
                            }
                          } catch (err) {
                            alert('Failed to upload profile picture.');
                          }
                        }
                      }}
                    />
                  </div>
                  <span className={styles.avatarUploadLabel}>Tap camera to upload custom photo</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className={styles.formInput} 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                {/* Choose Your Organic Avatar */}
                <div className={styles.avatarSelectionGroup}>
                  <label className={styles.formLabel}>Choose Your Organic Avatar</label>
                  <div className={styles.avatarOptionsGrid}>
                    <button
                      type="button"
                      className={`${styles.avatarOptionBtn} ${!avatar ? styles.avatarOptionBtnActive : ''}`}
                      onClick={() => setAvatar('')}
                      style={{ backgroundColor: '#F1F5F9' }}
                    >
                      <span className={styles.avatarOptionNone}>None</span>
                    </button>
                    {PRESET_AVATARS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className={`${styles.avatarOptionBtn} ${avatar === item.emoji ? styles.avatarOptionBtnActive : ''}`}
                        onClick={() => setAvatar(item.emoji)}
                        style={{ backgroundColor: item.color }}
                      >
                        <span>{item.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={editLoading} style={{ background: '#00a36c' }}>
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADDRESS BOOK MODAL ─── */}
      {showAddressModal && (
        <div className={styles.modalOverlay} onClick={() => { if(!showAddForm) setShowAddressModal(false); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{showAddForm ? 'Add New Address' : 'Address Book'}</h3>
              <button className={styles.closeBtn} onClick={() => {
                setShowAddForm(false);
                setShowAddressModal(false);
              }}>&times;</button>
            </div>
            
            <div className={styles.modalBody}>
              {!showAddForm ? (
                <>
                  <div className={styles.addressList}>
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`${styles.addressOption} ${activeAddress?.id === addr.id ? styles.addressOptionSelected : ''}`}
                        onClick={() => {
                          setActiveAddress(addr);
                          setShowAddressModal(false);
                        }}
                      >
                        <div className={styles.addressOptionInfo}>
                          <svg className={styles.addressPinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div className={styles.addressOptionDetails}>
                            <span className={styles.activeAddressTitle}>{addr.title}</span>
                            <span className={styles.activeAddressText}>
                              {(() => {
                                if (addr.address_line1 && addr.address_line1.includes('||')) {
                                  const [flat, street] = addr.address_line1.split('||');
                                  return `${flat}, ${street}`;
                                }
                                return addr.address_line1;
                              })()}
                              {addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}
                            </span>
                            <span className={styles.activeAddressReceiver}>
                              For: {addr.receiver_name} ({addr.receiver_mobile})
                            </span>
                          </div>
                        </div>
                        <button 
                          className={styles.addressDeleteBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(addr.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.addNewAddrBtn} onClick={() => setShowAddForm(true)}>
                    + Add New Address
                  </button>
                </>
              ) : (
                <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
                  <div className={styles.formGroup}>
                    <span className={styles.formLabel}>Address Type</span>
                    <div className={styles.typeContainer}>
                      {['Home', 'Office', 'Other'].map(t => (
                        <button 
                          key={t}
                          type="button" 
                          className={`${styles.typeBtn} ${addrTitle === t ? styles.typeBtnActive : ''}`}
                          onClick={() => setAddrTitle(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Receiver Name *</label>
                    <input 
                      type="text" 
                      placeholder="Receiver's Full Name" 
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mobile Number *</label>
                    <input 
                      type="tel" 
                      placeholder="Receiver's Mobile Number" 
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={10}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City *</label>
                    <input 
                      type="text" 
                      value={city}
                      className={styles.formInput}
                      disabled
                      style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#00a36c', marginTop: '2px', fontWeight: '500' }}>
                      * We only deliver to this city currently.
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Area / Colony / Street *</label>
                    <input 
                      type="text" 
                      placeholder="Area / Colony / Sector" 
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Flat / House / Building *</label>
                    <input 
                      type="text" 
                      placeholder="House No. / Building / Floor" 
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Landmark</label>
                    <input 
                      type="text" 
                      placeholder="Nearby Landmark (e.g. Near Mall)" 
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                      />
                      Set as Default Address
                    </label>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn}>Save Address</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDER HISTORY MODAL ─── */}
      {showOrdersModal && (
        <div className={styles.modalOverlay} onClick={() => setShowOrdersModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Order History</h3>
              <button className={styles.closeBtn} onClick={() => setShowOrdersModal(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {ordersLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading past orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
                  No past orders found. Keep shopping to see orders here!
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.map((ord) => (
                    <div key={ord.id} className={styles.orderOption}>
                      <div className={styles.addressOptionDetails}>
                        <span className={styles.activeAddressTitle}>Order #{ord.order_number}</span>
                        <span className={styles.activeAddressText} style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          Placed on: {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                        <span className={styles.activeAddressReceiver}>
                          Status: <span style={{ color: ord.status === 'delivered' ? '#16a34a' : '#ea580c', fontWeight: 'bold' }}>{ord.status.toUpperCase()}</span>
                        </span>
                        <span className={styles.activeAddressText} style={{ marginTop: '4px', fontWeight: '600' }}>
                          Total: AED {Number(ord.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
