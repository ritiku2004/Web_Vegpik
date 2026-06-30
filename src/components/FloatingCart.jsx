"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import styles from './FloatingCart.module.css';

export default function FloatingCart() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { cartItems, cartGrandTotal, cartTotalQuantity } = useContext(CartContext);
  const [visible, setVisible] = useState(false);

  // Hide on cart/checkout pages or when cart is empty
  const hiddenPaths = ['/cart', '/checkout'];
  const shouldHide = hiddenPaths.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (shouldHide || cartTotalQuantity === 0) {
      setVisible(false);
      return;
    }

    const handleScroll = () => {
      setVisible(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldHide, cartTotalQuantity]);

  const hasBottomBar = pathname.startsWith('/product') || pathname.startsWith('/orders/');

  if (shouldHide || cartTotalQuantity === 0) return null;

  return (
    <button
      className={`${styles.floatingCart} ${visible ? styles.show : ''} ${hasBottomBar ? styles.onProductPage : ''}`}
      onClick={() => navigate('/cart')}
      aria-label="View Cart"
    >
      <div className={styles.cartIconWrap}>
        <ShoppingCart size={20} />
        <span className={styles.badge}>{cartTotalQuantity}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.itemCount}>{cartTotalQuantity} item{cartTotalQuantity > 1 ? 's' : ''}</span>
        <span className={styles.price}>AED {Number(Math.round(cartGrandTotal * 100) / 100).toFixed(2)}</span>
      </div>
    </button>
  );
}
