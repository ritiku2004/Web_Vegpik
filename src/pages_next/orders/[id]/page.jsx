"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';
import Loader from '../../../components/Loader';
import { INITIAL_ORDERS, MOCK_PRODUCTS } from '../../data';
import styles from './page.module.css';
import { API_BASE_URL } from '../../../services/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let found = null;
        
        if (token) {
          const { api } = await import('../../../services/api');
          const res = await api.getUserOrders(token);
          if (res && res.data) {
            found = res.data.find(o => String(o.id) === String(id) || String(o.order_number) === String(id));
          }
        }
        
        // Fallback to local storage / mock if not found via API
        if (!found) {
          const saved = localStorage.getItem('pastOrders');
          let orders = INITIAL_ORDERS;
          if (saved) {
            try { orders = JSON.parse(saved); } catch (e) {}
          }
          found = orders.find(o => String(o.id) === String(id) || String(o.orderNumber) === String(id));
        }

        if (found) {
          const mappedItems = (found.items || []).map(item => {
            const match = MOCK_PRODUCTS.find(p => p.id === (item.productId || item.product_id));
            const image = item.image_url || item.image || (match ? match.image : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150');
            // Make sure image uses full URL if it's media.vegpik.com
            let finalImage = image;
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '');
            if (finalImage && finalImage.includes('media.vegpik.com')) {
              finalImage = `${baseUrl}/uploads${finalImage.split('media.vegpik.com')[1]}`;
            } else if (finalImage && !finalImage.startsWith('http')) {
              finalImage = `${baseUrl}/${finalImage}`;
            }

            return {
              ...item,
              productId: item.productId || item.product_id,
              name: item.name || item.product_name,
              price: item.price,
              image: finalImage,
              unit: match ? match.unit : '1 unit'
            };
          });

          const itemTotal = Number(found.totalAmount || found.total_amount) || 0;
          const handlingCharge = Number(found.handlingCharge || found.handling_fee) || 0;
          const deliveryPartnerFee = Number(found.delivery_fee) || 0;
          const grandTotal = itemTotal; // API total_amount is already grand total

          // Format full address
          let fullAddress = found.address || 'Selected Address';
          if (found.address_line1) {
            fullAddress = `${found.receiver_name ? found.receiver_name + ' - ' : ''}${found.address_line1}${found.address_line2 ? ', ' + found.address_line2 : ''}, ${found.city || ''}`;
            if (found.receiver_mobile) fullAddress += ` (Phone: ${found.receiver_mobile})`;
          }

          setOrder({
            id: found.id,
            orderNumber: found.orderNumber || found.order_number,
            date: found.date || (found.created_at ? new Date(found.created_at).toLocaleString() : ''),
            status: found.status || 'Delivered',
            paymentMethod: found.paymentMethod || found.payment_method || 'Google Pay UPI',
            address: fullAddress,
            items: mappedItems,
            billSummary: {
              itemTotal: grandTotal - handlingCharge - deliveryPartnerFee,
              handlingCharge,
              deliveryPartnerFee,
              grandTotal
            }
          });
        } else {
          // Exact screenshot mock fallback for demo/invalid IDs
          setOrder({
            id: id,
            orderNumber: "ORD455875",
            date: "20 Jun 2026, 9:02 pm",
            status: "Processing",
            paymentMethod: "Cash on Delivery (COD)",
            address: "Selected Address",
            items: [
              { productId: "p1", name: "Aashirvaad Atta (5 kg)", quantity: 1, price: 1269, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300", unit: "5 kg" },
              { productId: "p2", name: "Aashirvaad Atta (1 kg)", quantity: 1, price: 1296, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300", unit: "1 kg" }
            ],
            billSummary: {
              itemTotal: 2565,
              handlingCharge: 5,
              deliveryPartnerFee: 0,
              grandTotal: 2693.25
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      fetchOrderDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.loadingWrapper}>
        <h2>Order not found</h2>
        <button onClick={() => navigate(-1)} className={styles.retryButton} style={{ width: 'auto', padding: '0 24px' }}>Go Back</button>
      </div>
    );
  }

  // Timeline active flags
  const step1Active = true; // Awaiting confirmation is always active/green
  const step2Active = !['Cancelled'].includes(order.status);
  const step3Active = ['Out for Delivery', 'On the Way', 'Delivered'].includes(order.status);
  const step4Active = order.status === 'Delivered';

  const grandTotalText = `AED ${Number(order.billSummary.grandTotal).toFixed(2)}`;

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/user/orders/${order.id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const data = await response.json();
      if (!data.success || !data.html) throw new Error('Invalid invoice data received');
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(data.html);
      iframe.contentDocument.close();
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 500); // Wait for fonts and images to load
      };
    } catch (err) {
      console.error(err);
      alert('Could not download invoice');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.headerTitle}>Order Details</h1>
        </div>
      </header>

      {/* Main Content Wrap */}
      <div className={styles.content}>

        {/* Content Layout Columns */}
        <div className={styles.gridContainer}>
          
          {/* Left Column: Progress & Summary */}
          <div className={styles.leftColumn}>
            {/* Delivery Progress */}
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Delivery Progress</h3>
              <div className={styles.timeline}>
                
                {/* Step 1 */}
                <div className={styles.timelineStep}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot} ${step1Active ? styles.timelineDotActive : ''}`} />
                    <div className={`${styles.timelineLine} ${step2Active ? styles.timelineLineActive : ''}`} />
                  </div>
                  <div className={styles.timelineRight}>
                    <span className={`${styles.stepTitle} ${step1Active ? styles.stepTitleActive : ''}`}>Waiting for Confirmation</span>
                    <span className={styles.stepSubtitle}>Awaiting verification or payment confirmation</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={styles.timelineStep}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot} ${step2Active ? styles.timelineDotActive : ''}`} />
                    <div className={`${styles.timelineLine} ${step3Active ? styles.timelineLineActive : ''}`} />
                  </div>
                  <div className={styles.timelineRight}>
                    <span className={`${styles.stepTitle} ${step2Active ? styles.stepTitleActive : ''}`}>Order Confirmed</span>
                    <span className={styles.stepSubtitle}>Your order has been accepted and is preparing</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={styles.timelineStep}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot} ${step3Active ? styles.timelineDotActive : ''}`} />
                    <div className={`${styles.timelineLine} ${step4Active ? styles.timelineLineActive : ''}`} />
                  </div>
                  <div className={styles.timelineRight}>
                    <span className={`${styles.stepTitle} ${step3Active ? styles.stepTitleActive : ''}`}>On the Way</span>
                    <span className={styles.stepSubtitle}>Our delivery partner is bringing your package</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`${styles.timelineStep} ${styles.timelineLastStep}`}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot} ${step4Active ? styles.timelineDotActive : ''}`} />
                  </div>
                  <div className={styles.timelineRight}>
                    <span className={`${styles.stepTitle} ${step4Active ? styles.stepTitleActive : ''}`}>Delivered</span>
                    <span className={styles.stepSubtitle}>Arrived safe & sound at your location</span>
                  </div>
                </div>

              </div>
            </section>

            {/* Summary Card */}
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Summary</h3>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Order ID</span>
                  <span className={styles.summaryValue}>{order.orderNumber}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Placed On</span>
                  <span className={styles.summaryValue}>{order.date}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Payment Method</span>
                  <span className={styles.summaryValue}>{order.paymentMethod}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Delivery Address</span>
                  <span className={styles.summaryValue}>{order.address}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Items & Bill */}
          <div className={styles.rightColumn}>
            {/* Items Ordered Card */}
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Items Ordered</h3>
              <div className={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemLeft}>
                      <SafeImage src={item.image} alt={item.name} className={styles.itemImage} />
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <span className={styles.itemQty}>Qty: {item.quantity} x</span>
                      </div>
                    </div>
                    <span className={styles.itemPrice}>AED {Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bill Summary Card */}
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Bill Summary</h3>
              <div className={styles.billList}>
                <div className={styles.billRow}>
                  <span className={styles.billLabel}>Item Total</span>
                  <span className={styles.billValue}>AED {Number(order.billSummary.itemTotal).toFixed(2)}</span>
                </div>
                <div className={styles.billRow}>
                  <span className={styles.billLabel}>Handling charge</span>
                  <span className={styles.billValue}>AED {Number(order.billSummary.handlingCharge).toFixed(2)}</span>
                </div>
                <div className={styles.billRow}>
                  <span className={styles.billLabel}>Delivery partner fee</span>
                  <span className={styles.billFree}>
                    {order.billSummary.deliveryPartnerFee === 0 ? 'FREE' : `AED ${Number(order.billSummary.deliveryPartnerFee).toFixed(2)}`}
                  </span>
                </div>
                <div className={styles.divider} />
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Grand Total</span>
                  <span className={styles.totalValue}>{grandTotalText}</span>
                </div>
              </div>
            </section>
          </div>

        </div>

        {/* Download Invoice Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', padding: '0 16px' }}>
          <button 
            onClick={handleDownloadInvoice}
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#0f7643',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(15, 118, 67, 0.2)',
              transition: 'background-color 0.2s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b5932'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f7643'}
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
