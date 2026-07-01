"use client";

import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Clock, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import styles from './contact.module.css';

export default function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated, loading } = useContext(AuthContext);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname + location.search } });
    }
  }, [isAuthenticated, loading, navigate, location]);



  const [contactCards, setContactCards] = useState([]);
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchContactInfo = async () => {
      try {
        const data = await api.getContactInfo();
        if (isMounted) setContactCards(data);
      } catch (err) {
        console.error('Failed to load contact info', err);
      } finally {
        if (isMounted) setLoadingContact(false);
      }
    };
    fetchContactInfo();
    return () => { isMounted = false; };
  }, []);

  const subjects = [
    'Order & Delivery Issues',
    'Return & Refund Queries',
    'Bulk & Corporate Orders',
    'App & Technical Issues',
    'Payment Queries',
    'Other Inquiry'
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSubjectPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject) {
      alert('Please select a subject for your query.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description for your query.');
      return;
    }

    try {
      setLoadingSubmit(true);

      const email = user?.email || '';
      const name = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '';
      const phone = user?.phone_number || '';

      await api.submitSupportQuery(subject, description, email, name, phone);

      alert('Your query has been submitted successfully! We will get back to you soon.');
      setDescription('');
      setSubject('');
    } catch (err) {
      alert(err.message || 'Failed to submit support query. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => navigate(-1)} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Contact Us</h1>
      </div>

      <div className={styles.scrollContainer}>
        {/* Intro Section */}
        <div className={styles.introSection}>
          <h2 className={styles.heading}>We'd Love to Hear From You</h2>
          <p className={styles.paragraph}>
            Our dedicated team is standing by to assist you. Choose your preferred channel to get in touch with us:
          </p>
        </div>

        {/* Contact Methods List */}
        <div className={styles.cardsContainer}>
          {contactCards.filter(c => c.field_key !== 'OPERATING_HOURS' && c.value).map((card, index) => {
            let IconComponent, bgColor, iconColor;
            switch(card.field_key) {
              case 'WHATSAPP':
                IconComponent = MessageSquare; bgColor = '#E8FBEB'; iconColor = '#0f7643'; break;
              case 'PHONE':
                IconComponent = Phone; bgColor = '#FFFBEB'; iconColor = '#D97706'; break;
              case 'EMAIL':
                IconComponent = Mail; bgColor = '#EFF6FF'; iconColor = '#2563EB'; break;
              case 'OFFICE':
                IconComponent = MapPin; bgColor = '#F1F5F9'; iconColor = '#64748B'; break;
              default:
                IconComponent = MessageSquare; bgColor = '#F1F5F9'; iconColor = '#64748B'; break;
            }

            const handlePress = () => {
              if (card.action_label && (card.action_label.startsWith('http') || card.action_label.startsWith('tel:') || card.action_label.startsWith('mailto:'))) {
                window.open(card.action_label, '_blank');
              } else if (card.value) {
                if (card.field_key === 'PHONE') window.location.href = `tel:${card.value.split('/')[0].replace(/[^0-9+]/g, '')}`;
                else if (card.field_key === 'EMAIL') window.location.href = `mailto:${card.value}`;
              }
            };

            return (
              <div
                key={card.id || index}
                className={`${styles.contactCard} ${card.field_key === 'WHATSAPP' ? styles.highlightedCard : ''}`}
                onClick={handlePress}
              >
                <div className={styles.iconContainer} style={{ backgroundColor: bgColor }}>
                  <IconComponent size={22} color={iconColor} />
                </div>
                <div className={styles.contactDetails}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.contactTitle}>{card.title}</span>
                    {card.field_key === 'WHATSAPP' && (
                      <div className={styles.badge}>
                        <span className={styles.badgeText}>INSTANT</span>
                      </div>
                    )}
                  </div>
                  <p className={styles.contactSubtitle}>{card.description}</p>
                  {card.field_key === 'WHATSAPP' && card.action_label ? (
                    <span className={styles.actionText}>{card.action_label === card.value ? 'Start conversation' : card.action_label}</span>
                  ) : (
                    <p className={styles.contactValue}>{card.value}</p>
                  )}
                </div>
                <ChevronRight size={18} color="#64748b" />
              </div>
            );
          })}
        </div>

        {/* Operating Hours Banner */}
        {contactCards.filter(c => c.field_key === 'OPERATING_HOURS' && (c.value || c.description)).map((card, index) => (
          <div key={card.id || index} className={styles.hoursBanner}>
            <Clock size={20} className={styles.hoursIcon} />
            <div className={styles.hoursContent}>
              <h3 className={styles.hoursTitle}>{card.title}</h3>
              <p className={styles.hoursText}>
                {card.description}
              </p>
            </div>
          </div>
        ))}

        {/* Support Query Form */}
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Send Us a Message</h3>

          <div className={styles.inputGroup} ref={dropdownRef}>
            <span className={styles.fieldLabel}>What is your query related to? *</span>
            <div
              className={`${styles.pickerSelector} ${showSubjectPicker ? styles.pickerSelectorActive : ''}`}
              onClick={() => setShowSubjectPicker(!showSubjectPicker)}
            >
              <span className={`${styles.pickerSelectorText} ${!subject ? styles.placeholderText : ''}`}>
                {subject || 'Select a subject...'}
              </span>
              <ChevronDown size={18} color="#64748b" />
            </div>

            {showSubjectPicker && (
              <div className={styles.dropdownContainer}>
                {subjects.map((item) => (
                  <div
                    key={item}
                    className={`${styles.dropdownItem} ${subject === item ? styles.selectedDropdownItem : ''}`}
                    onClick={() => {
                      setSubject(item);
                      setShowSubjectPicker(false);
                    }}
                  >
                    <span className={`${styles.dropdownItemText} ${subject === item ? styles.selectedDropdownItemText : ''}`}>
                      {item}
                    </span>
                    {subject === item && <Check size={16} color="#0f7643" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel} htmlFor="query-desc">Describe your query *</label>
            <textarea
              id="query-desc"
              className={`${styles.textInput} styles.multilineInput`}
              placeholder="Describe details of your query or issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${loadingSubmit ? styles.submitButtonDisabled : ''}`}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <div className={styles.spinner} />
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
