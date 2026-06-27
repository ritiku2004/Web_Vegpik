import React from 'react';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import styles from './Privacy.module.css';

const Privacy = () => {
  return (
    <div className={styles.privacyContainer}>
      <SubPageHeader title="Privacy Policy" />

      <div className={styles.content}>
        {/* Trust Banner */}
        <div className={styles.trustBanner}>
          <div className={styles.trustIconWrapper}>
            <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 11 11 13 15 9"></polyline>
            </svg>
          </div>
          <div className={styles.trustContent}>
            <h3 className={styles.trustTitle}>Your Privacy is Our Priority</h3>
            <p className={styles.trustText}>
              We encrypt all transactions, never sell your data, and use industry-standard protocols to safeguard your info.
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className={styles.introSection}>
          <h2 className={styles.pageTitle}>Vegpik Privacy Policy</h2>
          <span className={styles.effectiveDate}>Effective Date: June 2026</span>
        </div>

        {/* Policy Sections */}
        <div className={styles.policySections}>
          {/* Section 1 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>1. Introduction</h3>
            </div>
            <p className={styles.cardBody}>
              Welcome to Vegpik ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This policy covers all information collected through our mobile application, and any related delivery, marketing, or customer services.
            </p>
          </div>

          {/* Section 2 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>2. Information We Collect</h3>
            </div>
            <p className={styles.cardBody}>
              We collect information you voluntarily provide (name, email, phone number, address) when setting up your profile or checking out. We also gather automated device telemetry (IP address, operating system, unique identifiers) to help improve system stability.
            </p>
          </div>

          {/* Section 3 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>3. How We Use Your Data</h3>
            </div>
            <p className={styles.cardBody}>
              We use personal information to:
            </p>
            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>Securely authenticate and manage your login sessions.</li>
              <li className={styles.bulletItem}>Process, pack, and deliver your grocery orders.</li>
              <li className={styles.bulletItem}>Send automated delivery notifications and real-time support status.</li>
              <li className={styles.bulletItem}>Review feedback and resolve active support inquiries.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>4. Information Sharing</h3>
            </div>
            <p className={styles.cardBody}>
              We only share your information with your direct consent, to comply with legal authorities, or to execute logistics (e.g. sharing delivery addresses with drivers and processing card payments). We never sell your details to advertising networks.
            </p>
          </div>

          {/* Section 5 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>5. Data Security & Retention</h3>
            </div>
            <p className={styles.cardBody}>
              We employ strict physical, electronic, and administrative controls. We retain your customer details only for as long as your account is active or as necessary to comply with tax and audit regulations.
            </p>
          </div>

          {/* Section 6 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>6. Your Rights</h3>
            </div>
            <p className={styles.cardBody}>
              You hold the right to view, modify, or delete your personal details. You can update your profile parameters or request account deletion at any time directly through the Profile panel in the app.
            </p>
          </div>

          {/* Section 7 */}
          <div className={styles.policyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>7. Contact Us</h3>
            </div>
            <p className={styles.cardBody}>
              Have questions, concerns, or requests regarding this policy? Reach out directly to our Data Protection Officer:
            </p>
            <a href="mailto:security@vegpik.com" className={styles.emailButton}>
              <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              security@vegpik.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
