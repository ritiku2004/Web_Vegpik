import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SubPageHeader.module.css';

const SubPageHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate(-1)} 
          aria-label="Go Back"
        >
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className={styles.headerTitle}>{title}</h1>
      </div>
    </header>
  );
};

export default SubPageHeader;
