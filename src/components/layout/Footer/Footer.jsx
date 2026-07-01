import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import logoImg from '../../../assets/logo.png';
import { categoryService } from '../../../services/categoryService';
import { api, API_BASE_URL } from '../../../services/api';
import { ROUTES } from '../../../utils/constants';
import styles from './Footer.module.css';

const Footer = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['socialLinks'],
    queryFn: () => api.getSocialLinks(),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await categoryService.getCategories();
        if (fetched && fetched.length > 0) {
          setCategories(fetched);
        }
      } catch (err) {
        console.error('Footer Category load failed:', err);
      }
    };
    fetchCategories();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      {/* ─── USP FEATURES ROW ─── */}
      <div className={styles.uspSection}>
        <div className={styles.uspContainer}>
          {/* USP 1 */}
          <div className={styles.uspItem}>
            <div className={styles.uspIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.uspIcon}>
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className={styles.uspTextContent}>
              <h4 className={styles.uspTitle}>Fast Delivery</h4>
              <p className={styles.uspDescription}>Superfast delivery right to your doorstep.</p>
            </div>
          </div>

          {/* USP 2 */}
          <div className={styles.uspItem}>
            <div className={styles.uspIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.uspIcon}>
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8a7 7 0 0 1-7 10z"></path>
                <path d="M9 11.33a3 3 0 0 1 2-2.33"></path>
              </svg>
            </div>
            <div className={styles.uspTextContent}>
              <h4 className={styles.uspTitle}>100% Organic & Fresh</h4>
              <p className={styles.uspDescription}>Directly sourced from trusted local farms.</p>
            </div>
          </div>

          {/* USP 3 */}
          <div className={styles.uspItem}>
            <div className={styles.uspIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.uspIcon}>
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div className={styles.uspTextContent}>
              <h4 className={styles.uspTitle}>Best Prices Guaranteed</h4>
              <p className={styles.uspDescription}>Top quality groceries at the lowest rates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN FOOTER SECTION ─── */}
      <div className={styles.mainFooter}>
        <div className={styles.footerContainer}>
          
          {/* Brand/Logo Column */}
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <img src={logoImg} alt="Vegpik logo" className={styles.footerLogoImg} />
              <span className={styles.brandName}>Vegpik</span>
            </div>
            <p className={styles.brandDesc}>
              India's premium organic grocery delivery app. Experience fresh vegetables, fruits, and dairy products at unmatched convenience and speed.
            </p>
            <div className={styles.safeBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.shieldIcon}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 11 2 2 4-4"></path>
              </svg>
              <span className={styles.safeBadgeText}>100% Safe Payments</span>
            </div>
          </div>

          {/* Useful Links Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>USEFUL LINKS</h4>
            <ul className={styles.linksList}>
              <li><Link to={ROUTES.PRIVACY}>Privacy Policy</Link></li>
              <li><Link to={ROUTES.TERMS}>Terms of Service</Link></li>
              <li><Link to={ROUTES.CONTACT}>Contact Support</Link></li>
            </ul>
          </div>

          {/* Categories Grid Column */}
          <div className={styles.categoriesCol}>
            <div className={styles.categoriesHeader}>
              <h4 className={styles.colTitle}>CATEGORIES</h4>
              <Link to={ROUTES.CATEGORIES} className={styles.seeAllCategories}>see all</Link>
            </div>
            
            <div className={styles.categoriesSubGrid}>
              {(() => {
                const displayCats = categories;
                if (displayCats.length === 0) {
                  return <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>No categories available</div>;
                }
                const chunked = [];
                const sliced = displayCats.slice(0, 6);
                for (let i = 0; i < sliced.length; i += 2) {
                  chunked.push(sliced.slice(i, i + 2));
                }
                return chunked.map((col, colIdx) => (
                  <div key={colIdx} className={styles.subGridCol}>
                    {col.map((cat) => (
                      <Link key={cat.id} to={`${ROUTES.CATEGORIES}?cat=${cat.id}`}>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>
      </div>

      {/* ─── COPYRIGHT & SOCIALS BOTTOM BAR ─── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyrightText}>
            © 2026 Vegpik Private Limited. All rights reserved.
          </p>
          
          <div className={styles.bottomRightActions}>
            <div className={styles.socialsGroup}>
              {socialLinks.map((social) => {
                if (!social.icon) return null;
                const src = social.icon.startsWith('http') ? social.icon : `${API_BASE_URL.replace('/api/v1', '')}/${social.icon.replace(/^\//, '')}`;
                return (
                  <a key={social.id} href={social.link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <img 
                      src={src} 
                      alt="Social" 
                      className={styles.socialIcon} 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                );
              })}
            </div>
            
            <button className={styles.scrollTopBtn} onClick={scrollToTop}>
              Scroll to Top <span className={styles.scrollArrow}>↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
