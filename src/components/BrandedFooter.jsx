import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import styles from './BrandedFooter.module.css';

export default function BrandedFooter() {
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['socialLinks'],
    queryFn: () => api.getSocialLinks(),
  });

  const handlePressLink = (url) => {
    if (url.startsWith('tel:') || url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  };

  const renderSocialIcon = (iconName) => {
    if (!iconName) return null;
    const apiBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');
    const src = iconName.startsWith('http') ? iconName : `${apiBase}/${iconName.replace(/^\//, '')}`;
    return (
      <img 
        src={src} 
        alt="Social Icon" 
        className={styles.svgIcon} 
        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
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

  return (
    <div className={styles.container}>
      <div className={styles.divider} />
      
      {/* Dynamic Social Media Link Icons */}
      <div className={styles.socialRow}>
        {socialLinks.map((social) => (
          <button 
            key={social.id} 
            className={styles.socialButton} 
            onClick={() => handlePressLink(social.link)} 
            aria-label={social.name}
          >
            {renderSocialIcon(social.icon)}
          </button>
        ))}
      </div>

      <div className={styles.titleText}>
        UAE's fresh grocery app <span className={styles.heartIcon}>❤️</span>
      </div>
      <div className={styles.brandText}>vegpik</div>
    </div>
  );
}
