import React, { useState } from 'react';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import Button from '../../components/common/Button/Button';
import styles from './Contact.module.css';

const Contact = () => {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setForm({ subject: '', message: '' });
  };

  return (
    <div className={styles.contactContainer}>
      <SubPageHeader title="Contact Us" />

      <div className={styles.content}>
        <div className={styles.introSection}>
          <h2 className={styles.introTitle}>We'd Love to Hear From You</h2>
          <p className={styles.introDescription}>
            Our dedicated team is standing by to assist you. Choose your preferred channel to get in touch with us:
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* WhatsApp Card */}
          <a href="https://wa.me/971501234567?text=Hello%20Vegpik%20Support" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.whatsappCard}`}>
            <div className={styles.cardIconWrapper}>
              <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitleRow}>
                <h3 className={styles.cardTitle}>Live WhatsApp Chat</h3>
                <span className={styles.instantBadge}>INSTANT</span>
              </div>
              <p className={styles.cardDescription}>Best for returns, refunds & order issues</p>
              <span className={styles.cardActionLink}>Start conversation</span>
            </div>
            <div className={styles.arrowWrapper}>
              <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </a>

          {/* Call Card */}
          <a href="tel:+97143979999" className={styles.contactCard}>
            <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Call Customer Care</h3>
              <p className={styles.cardDescription}>Speak directly with our support team</p>
              <span className={styles.cardValue}>+971 (4) 397-9999 / +971 50 123 4567</span>
            </div>
            <div className={styles.arrowWrapper}>
              <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </a>

          {/* Email Card */}
          <a href="mailto:support@vegpik.com" className={styles.contactCard}>
            <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Email Support</h3>
              <p className={styles.cardDescription}>For bulk orders & corporate feedback</p>
              <span className={styles.cardValue}>support@vegpik.com</span>
            </div>
            <div className={styles.arrowWrapper}>
              <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </a>

          {/* Corporate Office Card */}
          <a href="https://www.google.com/maps/search/?api=1&query=Office+311,+NBQ+Building,+Khalid+Bin+Al+Waleed+Rd,+Al+Hamriya,+Bur+Dubai,+Dubai,+UAE" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
            <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
              <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Corporate Office</h3>
              <p className={styles.cardDescription}>Bur Dubai, Dubai, UAE</p>
              <span className={styles.cardValue}>Office 311, NBQ Building, Bur Dubai</span>
            </div>
            <div className={styles.arrowWrapper}>
              <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </a>
        </div>

        {/* Operating Hours Alert */}
        <div className={styles.operatingHoursAlert}>
          <div className={styles.alertIconWrapper}>
            <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className={styles.alertContent}>
            <h4 className={styles.alertTitle}>Operating Hours</h4>
            <p className={styles.alertText}>
              Phone lines are active daily from <strong className={styles.highlightText}>6:00 AM to 11:00 PM</strong>. Inquiries sent via Email or WhatsApp outside these hours will be handled first thing in the morning.
            </p>
          </div>
        </div>

        {/* Send Us a Message Card */}
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Send Us a Message</h3>
          {success ? (
            <div className={styles.successMessage}>
              <div className={styles.successIconWrapper}>
                <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h4 className={styles.successTitle}>Message Sent!</h4>
              <p className={styles.successText}>Thank you for contacting us. We'll get back to you as soon as possible.</p>
              <Button onClick={() => setSuccess(false)} variant="outline">Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.messageForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>What is your query related to? <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.selectInput}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a subject...</option>
                    <option value="orders">Order & Delivery Issues</option>
                    <option value="refunds">Return & Refund Queries</option>
                    <option value="bulk">Bulk & Corporate Orders</option>
                    <option value="app">App & Technical Issues</option>
                    <option value="payment">Payment Queries</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                  <div className={styles.selectArrow}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Describe your query <span className={styles.required}>*</span></label>
                <textarea
                  className={styles.textareaInput}
                  rows="5"
                  placeholder="Describe details of your query or issue..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
