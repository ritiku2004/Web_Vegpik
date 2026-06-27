import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Oops! Page Not Found</h2>
        <p className={styles.desc}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>
        <Link to="/">
          <Button variant="primary" size="large">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
