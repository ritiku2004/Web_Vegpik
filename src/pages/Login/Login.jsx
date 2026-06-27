import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { ROUTES } from '../../utils/constants';
import { useGlobalState } from '../../context/GlobalStateContext';
import apiClient from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useGlobalState();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract redirect path from query param
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || ROUTES.HOME;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await apiClient.post('/user/auth/send-otp', { email });
      setStep(2);
    } catch (err) {
      console.error('Send OTP failed:', err);
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.post('/user/auth/verify-otp', { email, otp });
      // response contains { user, token } in data
      if (response && response.data) {
        const { user, token } = response.data;
        await login(user, token);
        navigate(redirectPath);
      } else {
        throw new Error('Invalid verification response');
      }
    } catch (err) {
      console.error('Verify OTP failed:', err);
      setErrorMsg(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Circular Logo Wrapper */}
        <div className={styles.logoCircle}>
          <img src={logoImg} alt="Vegpik Logo" className={styles.logoImg} />
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className={styles.brandTitle}>Vegpik</h1>
        <p className={styles.subtitle}>Fresh groceries delivered to you</p>

        {errorMsg && <p className={styles.errorText} style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</p>}

        {/* Form Step 1: Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className={styles.loginForm}>
            <label className={styles.inputLabel}>Enter Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              required
              disabled={loading}
            />
            <button type="submit" className={styles.continueBtn} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Form Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className={styles.loginForm}>
            <label className={styles.inputLabel}>Enter 6-digit OTP</label>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
              We sent a verification code to <strong>{email}</strong>.
              {email.endsWith('@vegpik.com') && <span style={{ display: 'block', color: '#16a34a', marginTop: '4px' }}>Use test code: 123456</span>}
            </p>
            <input 
              type="text" 
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={styles.emailInput}
              required
              disabled={loading}
              autoFocus
            />
            <button type="submit" className={styles.continueBtn} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep(1); setErrorMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#76a082', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px' }}
              disabled={loading}
            >
              Back to Email
            </button>
          </form>
        )}

        {/* Agreement Text */}
        <p className={styles.agreementText}>
          By continuing, you agree to our{' '}
          <span className={styles.linkText} onClick={() => alert('Terms of Service')}>
            Terms of Service
          </span>{' '}
          &{' '}
          <span className={styles.linkText} onClick={() => alert('Privacy Policy')}>
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
