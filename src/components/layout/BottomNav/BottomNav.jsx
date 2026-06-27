import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalState } from '../../../context/GlobalStateContext';
import { ROUTES } from '../../../utils/constants';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useGlobalState();

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const activePath = location.pathname;

  return (
    <nav className={styles.bottomNav}>
      <button 
        className={`${styles.navItem} ${activePath === ROUTES.HOME ? styles.navItemActive : ''}`} 
        onClick={() => navigate(ROUTES.HOME)}
      >
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className={styles.navLabel}>Home</span>
      </button>

      <button 
        className={`${styles.navItem} ${activePath === ROUTES.CATEGORIES ? styles.navItemActive : ''}`} 
        onClick={() => navigate(ROUTES.CATEGORIES)}
      >
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span className={styles.navLabel}>Categories</span>
      </button>

      <button 
        className={`${styles.navItem} ${activePath === ROUTES.CART ? styles.navItemActive : ''}`} 
        onClick={() => navigate(ROUTES.CART)}
      >
        <div className={styles.navCartIconWrapper}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className={styles.navCartBadge}>{cartCount}</span>}
        </div>
        <span className={styles.navLabel}>Cart</span>
      </button>

      <button 
        className={`${styles.navItem} ${activePath === '/order-again' ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/order-again')}
      >
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
        </svg>
        <span className={styles.navLabel}>Order Again</span>
      </button>
    </nav>
  );
};

export default BottomNav;
