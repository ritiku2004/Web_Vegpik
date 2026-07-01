import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Truck, Award, Leaf, ArrowUp, ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const navigate = useNavigate();
  const { activeShop } = useContext(AuthContext);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', activeShop?.id],
    queryFn: () => api.getCategories(activeShop?.id),
    enabled: !!activeShop?.id,
  });

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['socialLinks'],
    queryFn: () => api.getSocialLinks(),
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSocialIcon = (iconName) => {
    if (!iconName) return null;
    const apiBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');
    const src = iconName.startsWith('http') ? iconName : `${apiBase}/${iconName.replace(/^\//, '')}`;
    return (
      <img 
        src={src} 
        alt="Social Icon" 
        style={{ width: '16px', height: '16px', objectFit: 'contain' }}
        onError={(e) => {
          if (e.target.src.includes('media.vegpik.com')) {
            e.target.src = e.target.src.replace(/https?:\/\/media\.vegpik\.com/gi, `${apiBase}/uploads`);
          } else {
            e.target.style.display = 'none';
          }
        }}
      />
    );
  };

  const colSize = Math.ceil(categories.length / 3);
  const col1 = categories.slice(0, colSize);
  const col2 = categories.slice(colSize, colSize * 2);
  const col3 = categories.slice(colSize * 2);

  return (
    <footer className={styles.footer}>
      {/* 1. Value Highlights Strip */}
      <div className={styles.highlightsStrip}>
        <div className={styles.container}>
          <div className={styles.highlightsGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIconWrapper}>
                <Truck className={styles.highlightIcon} size={24} />
              </div>
              <div className={styles.highlightContent}>
                <h4 className={styles.highlightTitle}>Fast Delivery</h4>
                <p className={styles.highlightDesc}>Superfast delivery right to your doorstep.</p>
              </div>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIconWrapper}>
                <Leaf className={styles.highlightIcon} size={24} />
              </div>
              <div className={styles.highlightContent}>
                <h4 className={styles.highlightTitle}>100% Organic & Fresh</h4>
                <p className={styles.highlightDesc}>Directly sourced from trusted local farms.</p>
              </div>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIconWrapper}>
                <Award className={styles.highlightIcon} size={24} />
              </div>
              <div className={styles.highlightContent}>
                <h4 className={styles.highlightTitle}>Best Prices Guaranteed</h4>
                <p className={styles.highlightDesc}>Top quality groceries at the lowest rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 2. Main Content Grid */}
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brandSection}>
            <div className={styles.logoRow} onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Vegpik Logo" className={styles.logoImage} />
              
            </div>
            <p className={styles.brandTagline}>
              India's premium organic grocery delivery app. Experience fresh vegetables, fruits, and dairy products at unmatched convenience and speed.
            </p>
            <div className={styles.securityWrapper}>
              <ShieldCheck size={18} className={styles.shieldIcon} />
              <span>100% Safe Payments</span>
            </div>
          </div>

          {/* Useful Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionHeading}>Useful Links</h3>
            <div className={styles.linkColumn}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact Support</a>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.categoriesSection}>
            <div className={styles.categoriesHeader}>
              <h3 className={styles.sectionHeading}>Categories</h3>
              <button onClick={() => navigate('/categories')} className={styles.seeAllGreen}>
                see all
              </button>
            </div>
            <div className={styles.categoriesGrid}>
              <div className={styles.linkColumn}>
                {col1.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => navigate(`/categories?cat=${cat.id}`)}
                    className={styles.dynamicCategoryBtn}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className={styles.linkColumn}>
                {col2.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => navigate(`/categories?cat=${cat.id}`)}
                    className={styles.dynamicCategoryBtn}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className={styles.linkColumn}>
                {col3.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => navigate(`/categories?cat=${cat.id}`)}
                    className={styles.dynamicCategoryBtn}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <span className={styles.copyright}>
              © 2026 Vegpik Private Limited. All rights reserved.
            </span>
          </div>

          <div className={styles.bottomRight}>
            {/* Socials */}
            <div className={styles.socialBadgesRow}>
              {socialLinks.map((social) => (
                <a 
                  key={social.id} 
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.blackSocialBtn} 
                  aria-label={social.name}
                >
                  {renderSocialIcon(social.icon)}
                </a>
              ))}
            </div>

            {/* Back to top */}
            <button className={styles.scrollTopBtn} onClick={scrollToTop} aria-label="Scroll to top">
              <span>Scroll to Top</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
