"use client";

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AppDownloadModal from './AppDownloadModal';
import SplashScreen from './SplashScreen';
import FloatingCart from './FloatingCart';
import BottomNav from './layout/BottomNav/BottomNav';
import styles from '../pages_next/page.module.css';

export default function ConditionalLayout({ children }) {
  const pathname = useLocation().pathname;
  const hideLayout = pathname === '/login' || pathname === '/otp' || pathname === '/addresses' || pathname === '/about' || pathname === '/terms' || pathname === '/privacy' || pathname === '/contact' || pathname === '/profile' || pathname === '/notifications' || pathname.startsWith('/product/') || (pathname.startsWith('/orders/') && pathname !== '/orders');
  const isStaticAppPage = pathname === '/about';
  const isProductPage = pathname.startsWith('/product/');

  return (
    <>
      <SplashScreen />
      {hideLayout ? (
        <main style={{ width: '100%', minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: pathname === '/login' ? '0' : '80px' }}>
          <AppDownloadModal />
          <FloatingCart />
          {children}
          {pathname !== '/login' && <BottomNav />}
        </main>
      ) : (
        <div className={`${styles.mainContainer} ${isStaticAppPage ? 'about-page-layout' : ''} ${isProductPage ? 'product-page-layout' : ''}`}>
          <AppDownloadModal />
          <FloatingCart />
          {!isProductPage && (
            <div className="web-navbar-wrapper">
              <React.Suspense fallback={<div style={{ height: '70px', backgroundColor: '#0f7643' }} />}>
                <Navbar />
              </React.Suspense>
            </div>
          )}
          <main className={styles.contentContainer} style={{ paddingBottom: '80px' }}>
            {children}
          </main>
          <BottomNav />
          <div className="web-footer-wrapper">
            <Footer />
          </div>
        </div>
      )}
    </>
  );
}
