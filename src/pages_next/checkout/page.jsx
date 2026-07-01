"use client";

import React, { useContext, useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, Shield, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import SafeImage from '../../components/SafeImage';
import { api } from '../../services/api';
import styles from './checkout.module.css';



function CheckoutContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, token, user, activeAddress, serviceAvailable, activeShop, loading } = useContext(AuthContext);
  const {
    cartItems,
    cartSubtotal,
    cartSavings,
    deliveryFee,
    handlingFee,
    globalDiscountAmount,
    globalDiscountPercentage,
    cartGrandTotal,
    clearCart
  } = useContext(CartContext);

  const driverTip = Number(searchParams.get('tip')) || 0;
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [latestOrderNo, setLatestOrderNo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentSettings, setPaymentSettings] = useState(null);
  
  // PayPal inputs
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  // Bank Transfer inputs
  const [userBankName, setUserBankName] = useState('');
  const [userBankAccount, setUserBankAccount] = useState('');
  const [userBankIban, setUserBankIban] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await api.getPaymentSettings();
        setPaymentSettings(result);
      } catch (err) {
        console.error('Failed to fetch payment settings', err);
      }
    };
    fetchSettings();
  }, []);


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname + location.search } });
    } else if (!loading && cartItems.length === 0 && !showOrderSuccess) {
      navigate('/cart');
    }
  }, [isAuthenticated, loading, cartItems, navigate, showOrderSuccess, location]);

  const finalTotal = Math.round((cartGrandTotal + driverTip) * 100) / 100;

  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (paymentMethod === 'PayPal' && (!transactionId || !paymentScreenshot)) {
        alert('Please provide transaction ID and upload a screenshot of your payment.');
        setIsProcessing(false);
        return;
      }
      
      if (paymentMethod === 'Bank Transfer' && (!userBankName || !userBankAccount || !userBankIban)) {
        alert('Please fill in all your bank details to proceed.');
        setIsProcessing(false);
        return;
      }

      const orderPayload = new FormData();
      orderPayload.append('shopId', activeShop?.id || 1);
      orderPayload.append('addressId', activeAddress?.id);
      orderPayload.append('totalAmount', finalTotal);
      orderPayload.append('items', JSON.stringify(cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))));
      orderPayload.append('tipAmount', driverTip);
      orderPayload.append('discountAmount', cartSavings);
      orderPayload.append('handlingFee', handlingFee);
      orderPayload.append('deliveryFee', deliveryFee);
      orderPayload.append('paymentMethod', paymentMethod);

      if (paymentMethod === 'PayPal') {
        orderPayload.append('transactionId', transactionId);
        orderPayload.append('payment_screenshot', paymentScreenshot);
      }

      if (paymentMethod === 'Bank Transfer') {
        orderPayload.append('userBankName', userBankName);
        orderPayload.append('userBankAccount', userBankAccount);
        orderPayload.append('userBankIban', userBankIban);
      }

      // Since we send FormData, we need a custom api method or adjust api.createOrder.
      // Assuming api.createOrder uses axios and handles FormData if passed as payload.
      const result = await api.createOrder(orderPayload, token, true);
      const orderData = result.data || result;

      const newOrder = {
        id: orderData.orderId,
        orderNumber: orderData.orderNumber,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: orderData.status || 'Processing',
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.discountPrice,
        })),
        totalAmount: finalTotal,
      };

      if (typeof window !== 'undefined') {
        const savedOrders = JSON.parse(localStorage.getItem('pastOrders') || '[]');
        localStorage.setItem('pastOrders', JSON.stringify([newOrder, ...savedOrders]));
      }

      clearCart();
      setLatestOrderNo(orderData.orderNumber);
      setShowOrderSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred while placing the order.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || (!isAuthenticated && !showOrderSuccess)) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (showOrderSuccess) {
    return (
      <div className={styles.successWrapper}>
        <div className={styles.successCard}>
          <div className={styles.successIconCircle}>
            <CheckCircle size={48} color="#10B981" />
          </div>
          <h2 className={styles.successTitle}>Order Placed Successfully!</h2>
          <p className={styles.successText}>
            Your order <strong>{latestOrderNo}</strong> has been received and is being prepared for delivery.
          </p>
          <button className={styles.successBtn} onClick={() => navigate('/orders')}>
            Track Order Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.layout}>
        {/* Left Column: Details */}
        <div className={styles.leftColumn}>
          {/* Delivery Address Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardTitleGroup}>
                <MapPin size={20} className={styles.accentGreen} />
                <h3 className={styles.cardTitle}>Delivery Address</h3>
              </div>
            </div>
            {activeAddress ? (
              <div className={styles.addressBox}>
                <span className={styles.addressType}>{activeAddress.type}</span>
                <p className={styles.addressText}>
                  {activeAddress.flatNo}, {activeAddress.addressLine}
                </p>
                {activeAddress.receiverName && (
                  <p className={styles.receiverText}>
                    Recipient: {activeAddress.receiverName} | {activeAddress.receiverMobile}
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.warningBox}>
                <AlertTriangle size={18} />
                <span>Please select a delivery address.</span>
              </div>
            )}
          </div>



          {/* Payment Method Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardTitleGroup}>
                <CreditCard size={20} className={styles.accentGreen} />
                <h3 className={styles.cardTitle}>Payment Method</h3>
              </div>
            </div>
            <div className={styles.paymentOptions}>
              {(!paymentSettings || paymentSettings.is_cod_active !== 0 && paymentSettings.is_cod_active !== false) && (
                <label className={`${styles.paymentOption} ${paymentMethod === 'COD' ? styles.paymentOptionActive : ''}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className={styles.radioInput} />
                  <div className={styles.optionDetails}>
                    <span className={styles.optionTitle}>Cash on Delivery (COD)</span>
                  </div>
                </label>
              )}
              
              {(!paymentSettings || paymentSettings.is_paypal_active !== 0 && paymentSettings.is_paypal_active !== false) && (
                <>
                  <label className={`${styles.paymentOption} ${paymentMethod === 'PayPal' ? styles.paymentOptionActive : ''}`}>
                    <input type="radio" name="payment" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={() => setPaymentMethod('PayPal')} className={styles.radioInput} />
                    <div className={styles.optionDetails}>
                      <span className={styles.optionTitle}>PayPal</span>
                    </div>
                  </label>
                  
                  {paymentMethod === 'PayPal' && paymentSettings && (
                    <div style={{ marginLeft: '24px', marginBottom: '16px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <p style={{ marginBottom: '16px', fontSize: '14px', color: '#334155' }}>
                        Please send the payment to our PayPal ID: <strong style={{ color: 'var(--accent-primary)', fontSize: '15px' }}>{paymentSettings.paypal_id}</strong>
                      </p>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label className={styles.inputLabel}>Transaction ID <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required placeholder="Enter Transaction ID" className={styles.inputField} />
                      </div>
                      
                      <div>
                        <label className={styles.inputLabel}>Payment Screenshot <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files[0])} required className={styles.fileInput} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {(!paymentSettings || paymentSettings.is_bank_transfer_active !== 0 && paymentSettings.is_bank_transfer_active !== false) && (
                <>
                  <label className={`${styles.paymentOption} ${paymentMethod === 'Bank Transfer' ? styles.paymentOptionActive : ''}`}>
                    <input type="radio" name="payment" value="Bank Transfer" checked={paymentMethod === 'Bank Transfer'} onChange={() => setPaymentMethod('Bank Transfer')} className={styles.radioInput} />
                    <div className={styles.optionDetails}>
                      <span className={styles.optionTitle}>Bank Transfer</span>
                    </div>
                  </label>

                  {paymentMethod === 'Bank Transfer' && paymentSettings && (
                    <div style={{ marginLeft: '24px', marginBottom: '16px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #cbd5e1' }}>
                        <p style={{ fontWeight: '700', marginBottom: '12px', color: '#1e293b', fontSize: '15px' }}>Transfer to our Bank Account:</p>
                        <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#475569' }}>
                          <p>Bank Name: <strong style={{ color: '#1e293b' }}>{paymentSettings.bank_name}</strong></p>
                          <p>Account Number: <strong style={{ color: '#1e293b' }}>{paymentSettings.bank_account}</strong></p>
                          <p>IBAN: <strong style={{ color: '#1e293b' }}>{paymentSettings.bank_iban}</strong></p>
                        </div>
                      </div>
                      
                      <p style={{ fontWeight: '700', marginBottom: '16px', color: '#1e293b', fontSize: '15px' }}>Enter your bank details to verify:</p>
                      <div style={{ marginBottom: '16px' }}>
                        <label className={styles.inputLabel}>Your Bank Name <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userBankName} onChange={(e) => setUserBankName(e.target.value)} required placeholder="e.g. Citi Bank" className={styles.inputField} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label className={styles.inputLabel}>Your Account Number <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userBankAccount} onChange={(e) => setUserBankAccount(e.target.value)} required placeholder="e.g. 123456789" className={styles.inputField} />
                      </div>
                      <div>
                        <label className={styles.inputLabel}>Your IBAN <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={userBankIban} onChange={(e) => setUserBankIban(e.target.value)} required placeholder="e.g. AE00..." className={styles.inputField} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items Summary Card */}
          <div className={styles.card}>
            <div className={styles.cardTitleGroup} style={{ marginBottom: '16px' }}>
              <ShoppingBag size={20} className={styles.accentGreen} />
              <h3 className={styles.cardTitle}>Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h3>
            </div>
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemImageWrapper}>
                    <SafeImage src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <span className={styles.itemMeta}>{item.unit} &times; {item.quantity}</span>
                  </div>
                  <div className={styles.itemPriceBox}>
                    <span className={styles.itemPrice}>AED {Number(item.discountPrice * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Billing */}
        <div className={styles.rightColumn}>
          <div className={styles.billingCard}>
            <h3 className={styles.billingHeader}>Bill Details</h3>

            <div className={styles.billingRow}>
              <span>Items Subtotal</span>
              <span>AED {Number(cartSubtotal).toFixed(2)}</span>
            </div>

            {cartSavings > 0 && (
              <div className={styles.billingRow}>
                <span>Product Discount</span>
                <span className={styles.savingsValue}>-AED {Number(cartSavings).toFixed(2)}</span>
              </div>
            )}

            {globalDiscountAmount > 0 && (
              <div className={styles.billingRow}>
                <span>Offers {globalDiscountPercentage > 0 ? `(${globalDiscountPercentage}%)` : ''}</span>
                <span className={styles.savingsValue}>-AED {Number(globalDiscountAmount).toFixed(2)}</span>
              </div>
            )}

            <div className={styles.billingRow}>
              <span>Delivery Partner Fee</span>
              <span className={deliveryFee === 0 ? styles.freeValue : ''}>
                {deliveryFee === 0 ? 'FREE' : `AED ${Number(deliveryFee).toFixed(2)}`}
              </span>
            </div>

            <div className={styles.billingRow}>
              <span>Handling &amp; Packaging Charges</span>
              <span>AED {Number(handlingFee).toFixed(2)}</span>
            </div>



            {driverTip > 0 && (
              <div className={styles.billingRow}>
                <span>Driver Tip</span>
                <span>AED {Number(driverTip).toFixed(2)}</span>
              </div>
            )}

            <div className={styles.billingTotal}>
              <span>Grand Total</span>
              <span>AED {Number(finalTotal).toFixed(2)}</span>
            </div>

            <div className={styles.securityBadge}>
              <Shield size={16} />
              <span>Safe and Secure Payments</span>
            </div>

            <button
              className={styles.payBtn}
              onClick={handlePlaceOrder}
              disabled={isProcessing || !activeAddress || !serviceAvailable}
            >
              {isProcessing ? 'Processing...' : `Place Order • AED ${Number(finalTotal).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <p style={{ fontSize: '16px', color: '#64748b' }}>Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
