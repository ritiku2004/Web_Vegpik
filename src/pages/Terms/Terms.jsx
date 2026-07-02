import React from 'react';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import styles from './Terms.module.css';

const Terms = () => {
  return (
    <div className={styles.termsContainer}>
      <SubPageHeader title="Terms & Conditions" />

      <div className={styles.content}>
        {/* Summary Banner */}
        <div className={styles.summaryBanner}>
          <div className={styles.summaryIconContainer}>
            <svg className={styles.summaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryTitle}>Terms of Service Summary</h3>
            <p className={styles.summaryText}>
              By using Vegpik, you agree to our service terms. Below are the key terms regarding your account, orders, delivery, and refunds.
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className={styles.introSection}>
          <h2 className={styles.pageTitle}>Vegpik Terms of Service</h2>
          <span className={styles.effectiveDate}>Effective Date: June 2026</span>
        </div>

        {/* Terms Sections */}
        <div className={styles.termsSections}>
          {/* Section 1 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>1. Acceptance of Terms</h3>
            </div>
            <p className={styles.cardBody}>
              By downloading, accessing, or using the Vegpik application ("App"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access or use our services.
            </p>
          </div>

          {/* Section 2 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>2. User Accounts</h3>
            </div>
            <p className={styles.cardBody}>
              To place orders, you must create a verified account. You are responsible for safeguarding your login credentials (including OTP tokens sent to your email) and for all activities that occur under your profile.
            </p>
          </div>

          {/* Section 3 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>3. Use of the App</h3>
            </div>
            <p className={styles.cardBody}>
              You agree to use the App only for lawful, personal purposes. Violations or attempts to violate app security, including accessing unauthorized accounts or data scraping, will result in immediate termination.
            </p>
          </div>

          {/* Section 4 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>4. Orders, Pricing & Delivery</h3>
            </div>
            <p className={styles.cardBody}>
              All product prices are subject to change without notice. The delivery time shown in the app is an estimate and is not guaranteed. Actual delivery times may vary due to factors outside of our control, including but not limited to weather conditions, traffic, high order volumes, or unforeseen delays. We strive to deliver as quickly as possible but cannot be held liable for any delays.
            </p>
          </div>

          {/* Section 5 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>5. Returns & Refunds</h3>
            </div>
            <p className={styles.cardBody}>
              If you receive incorrect, damaged, or defective items, you must contact our customer support team within 24 hours of delivery. Refunds or replacements are issued at our sole discretion after proper verification.
            </p>
          </div>

          {/* Section 6 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M14.5 9a2.5 2.5 0 0 0-5 0v6a2.5 2.5 0 0 0 5 0"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>6. Intellectual Property</h3>
            </div>
            <p className={styles.cardBody}>
              The App and its original content, features, and brand design are the exclusive property of Vegpik and its licensors. Any reuse or duplication of assets is strictly prohibited without prior written consent.
            </p>
          </div>

          {/* Section 7 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>7. Limitation of Liability</h3>
            </div>
            <p className={styles.cardBody}>
              In no event shall Vegpik, its directors, partners, or employees be liable for any indirect, incidental, or special damages resulting from your use of the App or inability to access the service.
            </p>
          </div>

          {/* Section 8 */}
          <div className={styles.termsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>8. Changes to Terms</h3>
            </div>
            <p className={styles.cardBody}>
              We reserve the right to modify or replace these Terms at any time. By continuing to access or use our App after revisions become effective, you agree to be bound by the updated terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
