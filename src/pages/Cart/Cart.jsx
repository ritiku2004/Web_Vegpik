import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import logoImg from '../../assets/logo.png';
import styles from './Cart.module.css';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    addToCart, 
    addresses, 
    activeAddress, 
    saveAddress, 
    deleteAddress, 
    setActiveAddress, 
    user, 
    activeShop,
    cartLoading,
    logout
  } = useGlobalState();

  const [activeTip, setActiveTip] = useState(null); // null, 20, 30, 50, or 'custom'
  const [customTipVal, setCustomTipVal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Address modal states
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Address form fields
  const [title, setTitle] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleIncrement = (item) => {
    addToCart(item, 1);
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      addToCart(item, -1);
    } else {
      removeFromCart(item.id);
    }
  };

  const formatETA = (mins) => {
    if (!mins) return '14 MINS';
    return `${mins} MINS`;
  };

  // Bill calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Free delivery above 300, else 30
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 30;
  
  // Free handling & packaging above 500, else 15
  const handlingCharges = subtotal >= 500 || subtotal === 0 ? 0 : 15;

  let tipAmount = 0;
  if (activeTip === 20) tipAmount = 20;
  else if (activeTip === 30) tipAmount = 30;
  else if (activeTip === 50) tipAmount = 50;
  else if (activeTip === 'custom') {
    const parsed = parseInt(customTipVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      tipAmount = parsed;
    }
  }

  const grandTotal = subtotal + deliveryFee + handlingCharges + tipAmount;

  const handleTipClick = (tipVal) => {
    if (tipVal === 'custom') {
      setActiveTip('custom');
      setShowCustomInput(true);
    } else {
      if (activeTip === tipVal) {
        setActiveTip(null); // toggle off
      } else {
        setActiveTip(tipVal);
      }
      setShowCustomInput(false);
    }
  };

  const handleCustomTipSubmit = (e) => {
    e.preventDefault();
    setShowCustomInput(false);
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login, with a redirect parameter back to cart
      navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.CART}`);
      return;
    }

    if (!activeAddress) {
      alert('Please add or select a delivery address before checkout.');
      setShowAddressListModal(true);
      return;
    }

    alert(`Proceeding to checkout with total: ₹${grandTotal} for user ${user.email} delivering to ${activeAddress.title}`);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !receiverName || !receiverMobile) {
      alert('Please fill all required address fields.');
      return;
    }

    const payload = {
      title,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state: state || 'State',
      latitude: null,
      longitude: null,
      is_default: isDefault,
      receiver_name: receiverName,
      receiver_mobile: receiverMobile,
    };

    await saveAddress(payload);
    
    // Clear form
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setReceiverName('');
    setReceiverMobile('');
    setIsDefault(false);
    setShowAddForm(false);
  };

  const cartTotalQuantity = cart.reduce((acc, c) => acc + c.quantity, 0);

  if (cartLoading && cart.length === 0) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader text="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      
      {/* ─── HEADER ─── */}
      <header className={styles.greenHeader}>
        <div className={styles.headerContainer}>
          {/* Logo Section */}
          <div className={styles.logoSection} onClick={() => navigate(ROUTES.HOME)} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="Vegpik Logo" className={styles.appLogo} />
            <span className={styles.logoText}>Vegpik</span>
          </div>

          {/* Delivery ETA Pill */}
          <div className={styles.deliveryPill} onClick={() => setShowAddressListModal(true)} style={{ cursor: 'pointer' }}>
            <div className={styles.pillLabelContainer}>
              <span className={styles.deliverInLabel}>DELIVER IN</span>
              <span className={styles.deliveryTime}>
                {activeShop && activeShop.serviceAvailable 
                  ? formatETA(activeShop.deliveryETA || 14) 
                  : '14 MINS'}
              </span>
            </div>
            <div className={styles.pillAddressContainer}>
              <span className={styles.addressText}>
                {activeAddress
                  ? `${activeAddress.title} - ${activeAddress.address_line1}, ${activeAddress.city}`
                  : 'Select Delivery Address'}
              </span>
              <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.headerActions}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <svg className={styles.iconBell} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {user ? (
              <div className={styles.profileContainer}>
                <button 
                  className={styles.profileAvatarBtn} 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Profile menu"
                >
                  {user.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
                {showProfileMenu && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user.first_name} {user.last_name || ''}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                    <button className={styles.dropdownItemLink} onClick={() => { navigate(ROUTES.PROFILE); setShowProfileMenu(false); }}>
                      My Profile
                    </button>
                    <button className={styles.dropdownItem} onClick={() => { logout(); setShowProfileMenu(false); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={() => navigate(ROUTES.LOGIN)}>Login</button>
            )}
            <button className={styles.cartBtn} onClick={() => navigate(ROUTES.CART)}>
              <div className={styles.cartBtnContent}>
                <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Cart</span>
              </div>
              {cartTotalQuantity > 0 && (
                <span className={styles.cartBadgeHeader}>{cartTotalQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CART PAGE GRID ─── */}
      <main className={styles.mainContent}>
        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <svg className={styles.emptySvgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p className={styles.emptyText}>Your cart is empty. Browse products and add items.</p>
            <button className={styles.shopNowBtn} onClick={() => navigate(ROUTES.HOME)}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className={styles.cartLayoutGrid}>
            
            {/* Left Section: Cart Items */}
            <div className={styles.itemsColumn}>
              {cart.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  {/* Left square box for product image */}
                  <div className={styles.itemImageWrapper}>
                    <img 
                      src={item.image || ''} 
                      alt={item.name} 
                      className={styles.itemImage} 
                    />
                  </div>

                  {/* Middle Text Details */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    {item.unit && <span className={styles.itemUnit}>{item.unit}</span>}
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>₹{item.price}</span>
                      <span className={styles.itemMultiplier}>&times; {item.quantity}</span>
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className={styles.itemControls}>
                    <div className={styles.quantityPill}>
                      <button className={styles.pillBtn} onClick={() => handleDecrement(item)}>-</button>
                      <span className={styles.pillValue}>{item.quantity}</span>
                      <button className={styles.pillBtn} onClick={() => handleIncrement(item)}>+</button>
                    </div>
                    <button 
                      className={styles.trashBtn} 
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Section: Address Selection & Bill Details */}
            <div className={styles.billColumn}>
              
              {/* Address Selection Section */}
              <div className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <h3 className={styles.addressTitle}>Delivery Address</h3>
                  <button className={styles.changeAddressBtn} onClick={() => setShowAddressListModal(true)}>
                    {addresses.length > 0 ? 'Change' : 'Add New'}
                  </button>
                </div>
                {activeAddress ? (
                  <div className={styles.activeAddressBox}>
                    <svg className={styles.addressPinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div className={styles.activeAddressDetails}>
                      <span className={styles.activeAddressTitle}>{activeAddress.title}</span>
                      <span className={styles.activeAddressText}>
                        {activeAddress.address_line1} {activeAddress.address_line2 ? `, ${activeAddress.address_line2}` : ''}, {activeAddress.city}
                      </span>
                      <span className={styles.activeAddressReceiver}>
                        For: {activeAddress.receiver_name} ({activeAddress.receiver_mobile})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.activeAddressBox} style={{ color: '#64748b', fontSize: '0.9rem', justifyContent: 'center', padding: '24px 16px' }}>
                    No delivery address set. Click 'Add New' to add an address.
                  </div>
                )}
              </div>

              {/* Bill Card */}
              <div className={styles.billCard}>
                <h3 className={styles.billTitle}>Bill Details</h3>

                {/* Tip Delivery Partner Section */}
                <div className={styles.tipPartnerSection}>
                  <div className={styles.tipHeaderRow}>
                    <div className={styles.tipTextCol}>
                      <h4 className={styles.tipTitle}>Tip your delivery partner</h4>
                      <p className={styles.tipSubtitle}>
                        Your kindness means a lot! 100% of your tip goes directly to the partner.
                      </p>
                    </div>
                    <div className={styles.tipIconCol}>
                      <svg className={styles.scooterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="1" y="16" width="6" height="5" />
                        <path d="M12 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        <path d="M3 20a6 6 0 0 1 12 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>

                  {/* Tip options */}
                  <div className={styles.tipOptionsGrid}>
                    <button 
                      className={`${styles.tipBtnOption} ${activeTip === 20 ? styles.tipActive : ''}`} 
                      onClick={() => handleTipClick(20)}
                    >
                      <span className={styles.tipHeart}>♥</span> ₹20
                    </button>
                    <button 
                      className={`${styles.tipBtnOption} ${activeTip === 30 ? styles.tipActive : ''}`} 
                      onClick={() => handleTipClick(30)}
                    >
                      <span className={styles.tipHeart}>♥</span> ₹30
                    </button>
                    <button 
                      className={`${styles.tipBtnOption} ${activeTip === 50 ? styles.tipActive : ''}`} 
                      onClick={() => handleTipClick(50)}
                    >
                      <span className={styles.tipHeart}>♥</span> ₹50
                    </button>
                    <button 
                      className={`${styles.tipBtnOption} ${activeTip === 'custom' ? styles.tipActive : ''}`} 
                      onClick={() => handleTipClick('custom')}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Custom tip input form */}
                  {showCustomInput && (
                    <form onSubmit={handleCustomTipSubmit} className={styles.customTipForm}>
                      <input 
                        type="number" 
                        placeholder="Enter tip amount" 
                        value={customTipVal} 
                        onChange={(e) => setCustomTipVal(e.target.value)} 
                        className={styles.customTipInput}
                        min="1"
                      />
                      <button type="submit" className={styles.customTipSubmitBtn}>Apply</button>
                    </form>
                  )}
                </div>

                {/* Subtotals rows */}
                <div className={styles.billingRows}>
                  <div className={styles.billRow}>
                    <span className={styles.rowLabel}>Subtotal</span>
                    <span className={styles.rowVal}>₹{subtotal}</span>
                  </div>
                  
                  <div className={styles.billRow}>
                    <span className={styles.rowLabel}>Delivery Partner Fee</span>
                    <span className={`${styles.rowVal} ${deliveryFee === 0 ? styles.freeText : ''}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className={styles.billRow}>
                    <span className={styles.rowLabel}>Handling & Packaging Charges</span>
                    <span className={`${styles.rowVal} ${handlingCharges === 0 ? styles.freeText : ''}`}>
                      {handlingCharges === 0 ? 'FREE' : `₹${handlingCharges}`}
                    </span>
                  </div>

                  {tipAmount > 0 && (
                    <div className={styles.billRow}>
                      <span className={styles.rowLabel}>Delivery Partner Tip</span>
                      <span className={styles.rowVal}>₹{tipAmount}</span>
                    </div>
                  )}

                  <div className={styles.grandTotalDivider} />

                  <div className={styles.grandTotalRow}>
                    <span className={styles.totalLabel}>Grand Total</span>
                    <span className={styles.totalVal}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className={styles.disclaimerText}>
                  * Prices are inclusive of all taxes. Free delivery above ₹300, and free packaging/handling above ₹500.
                </p>

                {/* Proceed Button */}
                <button className={styles.proceedBtn} onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ─── MOBILE STICKY BOTTOM CHECKOUT BAR ─── */}
      {cart.length > 0 && (
        <div className={styles.mobileStickyBottomBar}>
          <div className={styles.mobileStickyLeft}>
            <div className={styles.mobileAddressRow} onClick={() => setShowAddressListModal(true)}>
              <svg className={styles.mobilePinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className={styles.mobileAddressText}>
                {activeAddress
                  ? `Delivering to: ${activeAddress.title} | ${activeAddress.address_line1}` 
                  : 'Select Delivery Address'}
              </span>
            </div>
            <div className={styles.mobileTotalRow}>
              <span className={styles.mobileTotalAmount}>₹{grandTotal}</span>
              <span className={styles.mobileTotalLabel}>TOTAL AMOUNT</span>
            </div>
          </div>
          <button className={styles.mobileProceedBtn} onClick={handleCheckout}>
            Proceed to<br />Checkout
          </button>
        </div>
      )}

      {/* ─── MOBILE BOTTOM TABS ─── */}
      <div className={styles.bottomTabs}>
        <button className={styles.tabItem} onClick={() => navigate(ROUTES.HOME)}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className={styles.tabLabel}>Home</span>
        </button>
        <button className={styles.tabItem} onClick={() => navigate(ROUTES.CATEGORIES)}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className={styles.tabLabel}>Categories</span>
        </button>
        <button className={`${styles.tabItem} ${styles.tabItemActive}`}>
          <div className={styles.cartIconWrapper}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartTotalQuantity > 0 && (
              <span className={styles.cartBadge}>{cartTotalQuantity}</span>
            )}
          </div>
          <span className={styles.tabLabel}>Cart</span>
        </button>
        <button className={styles.tabItem}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span className={styles.tabLabel}>Order Again</span>
        </button>
      </div>

      {/* ─── ADDRESS MANAGEMENT MODAL ─── */}
      {showAddressListModal && (
        <div className={styles.modalOverlay} onClick={() => { if(!showAddForm) setShowAddressListModal(false); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{showAddForm ? 'Add Delivery Address' : 'Select Delivery Address'}</h3>
              <button className={styles.closeBtn} onClick={() => {
                setShowAddForm(false);
                setShowAddressListModal(false);
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
                          setShowAddressListModal(false);
                        }}
                      >
                        <div className={styles.addressOptionInfo}>
                          <svg className={styles.addressPinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginTop: '0' }}>
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
                          aria-label="Delete address"
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
                          className={`${styles.typeBtn} ${title === t ? styles.typeBtnActive : ''}`}
                          onClick={() => setTitle(t)}
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

    </div>
  );
};

export default Cart;
