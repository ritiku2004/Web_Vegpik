import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalState } from '../../../context/GlobalStateContext';
import { ROUTES } from '../../../utils/constants';
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useGlobalState();
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  if (location.pathname === ROUTES.HOME || location.pathname === ROUTES.CATEGORIES || location.pathname === ROUTES.CART) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.navContainer} container`}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          Veg<span className={styles.logoHighlight}>pik</span>
        </Link>
        
        <nav className={styles.nav}>
          <Link to={ROUTES.HOME} className={isLinkActive(ROUTES.HOME)}>Home</Link>
          <Link to={ROUTES.ABOUT} className={isLinkActive(ROUTES.ABOUT)}>About</Link>
          <Link to={ROUTES.SERVICES} className={isLinkActive(ROUTES.SERVICES)}>Services</Link>
          <Link to={ROUTES.CONTACT} className={isLinkActive(ROUTES.CONTACT)}>Contact</Link>
        </nav>

        <div className={styles.actions}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
