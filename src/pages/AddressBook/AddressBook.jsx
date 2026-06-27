import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import styles from './AddressBook.module.css';

const AddressBook = () => {
  const navigate = useNavigate();
  const { addresses, activeAddress, saveAddress, deleteAddress, setActiveAddress } = useGlobalState();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [city, setCity] = useState('Kurnool');
  const [area, setArea] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

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

  return (
    <div className={styles.addressBookContainer}>
      <SubPageHeader title="Manage Addresses" />

      <div className={styles.content}>
        <div className={styles.layoutGrid}>
          {/* Address List Column */}
          <div className={styles.listColumn}>
            <h3 className={styles.sectionTitle}>Saved Addresses</h3>
            {addresses.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No saved addresses found. Add an address to get started!</p>
              </div>
            ) : (
              <div className={styles.addressList}>
                {addresses.map((addr) => {
                  const isActive = activeAddress?.id === addr.id;
                  return (
                    <div 
                      key={addr.id} 
                      className={`${styles.addressCard} ${isActive ? styles.addressCardActive : ''}`}
                      onClick={() => setActiveAddress(addr)}
                    >
                      <div className={styles.addressInfo}>
                        <div className={styles.iconWrapper}>
                          <svg className={styles.pinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className={styles.addressDetails}>
                          <div className={styles.titleRow}>
                            <span className={styles.addressTitle}>{addr.title}</span>
                            {isActive && <span className={styles.activeBadge}>Active</span>}
                          </div>
                          <span className={styles.addressText}>
                            {(() => {
                              if (addr.address_line1 && addr.address_line1.includes('||')) {
                                const [flat, street] = addr.address_line1.split('||');
                                  return `${flat}, ${street}`;
                              }
                              return addr.address_line1;
                            })()}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}
                          </span>
                          <span className={styles.receiverText}>
                            For: {addr.receiver_name} ({addr.receiver_mobile})
                          </span>
                        </div>
                      </div>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this address?')) {
                            deleteAddress(addr.id);
                          }
                        }}
                        aria-label="Delete address"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!showAddForm && (
              <button className={styles.addNewBtn} onClick={() => setShowAddForm(true)}>
                + Add New Address
              </button>
            )}
          </div>

          {/* Form Column */}
          {showAddForm && (
            <div className={styles.formColumn}>
              <div className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Add New Address</h3>
                  <button className={styles.closeFormBtn} onClick={() => setShowAddForm(false)}>&times;</button>
                </div>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBook;
