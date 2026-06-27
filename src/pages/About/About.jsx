import React from 'react';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import logoImg from '../../assets/logo.png';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <SubPageHeader title="About Us" />

      <main className={styles.mainContent}>
        {/* Hero Banner Section */}
        <section className={styles.heroSection}>
          <div className={styles.logoOuterCircle}>
            <div className={styles.logoInnerCircle}>
              <img src={logoImg} alt="Vegpik Logo" className={styles.logoImage} />
            </div>
          </div>
          <h2 className={styles.heroSubtitle}>Nourishing Lives, Freshly & Fast</h2>
          <div className={styles.badgeContainer}>
            <span className={styles.badgeText}>100% ORGANIC PROMISE</span>
          </div>
        </section>

        {/* Narrative / Intro */}
        <section className={styles.section}>
          <h3 className={styles.welcomeText}>Welcome to the Future of Grocery</h3>
          <p className={styles.paragraph}>
            At Vegpik, we believe that access to clean, fresh, and nutritious food is a fundamental right. We are rewriting the rules of the grocery supply chain to bring farm-fresh produce and daily household essentials straight to your home.
          </p>
        </section>

        {/* Stats Grid */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span className={styles.statNumber}>50K+</span>
            <span className={styles.statLabel}>Happy Users</span>
          </div>
          <div className={styles.statCard}>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className={styles.statNumber}>15 Min</span>
            <span className={styles.statLabel}>Avg Delivery</span>
          </div>
          <div className={styles.statCard}>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="M12 6a6 6 0 0 0-6 6c0 2.22 1.206 4.16 3 5.19A6.002 6.002 0 0 0 18 12a6 6 0 0 0-6-6z"></path>
            </svg>
            <span className={styles.statNumber}>150+</span>
            <span className={styles.statLabel}>Partner Farms</span>
          </div>
          <div className={styles.statCard}>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Quality Check</span>
          </div>
        </section>

        {/* Pillars / Values Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Our Core Pillars</h3>
          
          {/* Pillar 1 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconContainer}>
              <svg className={styles.pillarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"></path>
                <path d="M12 6v12M6 12h12"></path>
              </svg>
            </div>
            <div className={styles.pillarContent}>
              <h4 className={styles.pillarTitle}>Direct From Local Farms</h4>
              <p className={styles.pillarDescription}>
                We partner directly with regional growers and local micro-warehouses to maintain premium quality checks and skip middleman delays.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconContainer}>
              <svg className={styles.pillarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div className={styles.pillarContent}>
              <h4 className={styles.pillarTitle}>Hyperlocal & Superfast</h4>
              <p className={styles.pillarDescription}>
                Our cold-chain logistics system keeps temperature-controlled bags optimized so items arrive fresh and fast.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconContainer}>
              <svg className={styles.pillarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className={styles.pillarContent}>
              <h4 className={styles.pillarTitle}>Absolute Safety First</h4>
              <p className={styles.pillarDescription}>
                Multi-layer disinfection, touchless packing, and continuous sanitization protocols ensure total safety from farm to fork.
              </p>
            </div>
          </div>
        </section>

        {/* Narrative / Promise card */}
        <section className={styles.promiseCard}>
          <div className={styles.promiseContent}>
            <svg className={styles.promiseIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h4 className={styles.promiseTitle}>Our Green Commitment</h4>
            <p className={styles.promiseDescription}>
              We are dedicated to sustainable delivery. Over 90% of our packaging is biodegradable, and we actively work with our delivery network to minimize our carbon footprint.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.aboutFooter}>
          <span className={styles.footerText}>Version 1.0.0</span>
          <span className={styles.footerSubtext}>Proudly serving healthy living</span>
          <span className={styles.footerHeart}>Made with 💚 for fresh eating</span>
        </footer>
      </main>
    </div>
  );
};

export default About;
