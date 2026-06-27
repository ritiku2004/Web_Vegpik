import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import apiClient from '../../services/api';
import styles from './Profile.module.css';

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
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Address form fields
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Initialize edit fields
  useEffect(() => {
    if (user) {
      setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
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
        phone_number: phone
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
    if (!addressLine1 || !city || !receiverName || !receiverMobile) {
      alert('Please fill all required fields.');
      return;
    }
    const payload = {
      title: addrTitle,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state: state || 'State',
      latitude: null,
      longitude: null,
      is_default: isDefault,
      receiver_name: receiverName,
      receiver_mobile: receiverMobile
    };
    await saveAddress(payload);
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setReceiverName('');
    setReceiverMobile('');
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
      
      {/* ─── GREEN PROFILE HEADER ─── */}
      <header className={styles.greenHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className={styles.headerTitle}>My Profile</h1>
      </header>

      {/* ─── PROFILE CONTENT CONTAINER ─── */}
      <div className={styles.profileContent}>
        
        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle}>
              {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt="Profile" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.first_name ? user.first_name[0].toUpperCase() : 'T'}
                </div>
              )}
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
          <div className={styles.menuRow} onClick={() => { fetchOrders(); setShowOrdersModal(true); }}>
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
          <div className={styles.menuRow} onClick={() => setShowAddressModal(true)}>
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
          <div className={styles.menuRow} onClick={() => alert('Privacy Policy: All details secured.')}>
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
          <div className={styles.menuRow} onClick={() => alert('Terms & Conditions: Standard terms apply.')}>
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
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
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
                  <label className={styles.formLabel}>Mobile Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn} disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    Cancel
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
                              {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}
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
                    <label className={styles.formLabel}>Address Line 1 *</label>
                    <input 
                      type="text" 
                      placeholder="Flat/House/Office No., Building Name" 
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Address Line 2 (Landmark)</label>
                    <input 
                      type="text" 
                      placeholder="Nearby landmark (optional)" 
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>City *</label>
                      <input 
                        type="text" 
                        placeholder="City" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>State/Emirate</label>
                      <input 
                        type="text" 
                        placeholder="State" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Receiver Name *</label>
                      <input 
                        type="text" 
                        placeholder="Name of recipient" 
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Receiver Mobile *</label>
                      <input 
                        type="tel" 
                        placeholder="Mobile number" 
                        value={receiverMobile}
                        onChange={(e) => setReceiverMobile(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
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
                          Total: ₹{ord.total_price}
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
