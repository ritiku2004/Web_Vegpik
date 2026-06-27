import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ size = 'medium', color = 'primary', text }) => {
  const spinnerClass = `${styles.spinner} ${styles[size]} ${styles[color]}`;

  return (
    <div className={styles.loaderWrapper}>
      <div className={spinnerClass} aria-label="Loading"></div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default Loader;
