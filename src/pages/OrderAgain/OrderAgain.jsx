import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import apiClient from '../../services/api';
import styles from './OrderAgain.module.css';
import BottomNav from '../../components/layout/BottomNav/BottomNav';
import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';

const PRESET_AVATARS = [
  { emoji: '🍅', color: '#FEE2E2', label: 'Tomato' },
  { emoji: '🥦', color: '#D1FAE5', label: 'Broccoli' },
  { emoji: '🥕', color: '#FFEDD5', label: 'Carrot' },
  { emoji: '🥑', color: '#E0F2FE', label: 'Avocado' },
  { emoji: '🍓', color: '#FFF1F2', label: 'Strawberry' },
  { emoji: '🍋', color: '#FEF9C3', label: 'Lemon' },
  { emoji: '🍇', color: '#F3E8FF', label: 'Grapes' },
  { emoji: '🍉', color: '#ECFDF5', label: 'Watermelon' },
  { emoji: '🍎', color: '#FEF2F2', label: 'Apple' },
];

const OrderAgain = () => {
  const navigate = useNavigate();
  const { user, cart, addToCart, activeAddress } = useGlobalState();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  // Calculate cart count
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/user/orders');
        if (response && response.data) {
          setOrders(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getAvatarColor = (url) => {
    if (!url) return '#FEE2E2';
    const match = PRESET_AVATARS.find(a => a.emoji === url);
    return match ? match.color : '#F1F5F9';
  };

  const getAvatarContent = (url, firstName) => {
    if (!url || avatarError) {
      return firstName ? firstName[0].toUpperCase() : 'U';
    }
    const isEmoji = !url.includes('/') && !url.includes('.');
    if (isEmoji) {
      return <span className={styles.avatarEmoji}>{url}</span>;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    
    let fullUrl = url;
    if (url.includes('media.vegpik.com')) {
      fullUrl = `${baseUrl}/uploads${url.split('media.vegpik.com')[1]}`;
    } else if (!url.startsWith('http')) {
      fullUrl = `${baseUrl}/${url}`;
    }

    return (
      <img 
        src={fullUrl} 
        alt="Profile" 
        className={styles.avatarImg} 
        onError={() => setAvatarError(true)}
      />
    );
  };

  const handleOrderAgainAction = (items) => {
    if (!items || items.length === 0) return;
    items.forEach((item) => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: Number(item.price),
        image_url: item.image_url,
        stock_quantity: 99
      }, item.quantity || 1);
    });
    navigate(ROUTES.CART);
  };

  const handleDownloadReceipt = async (orderId) => {
    try {
      setDownloadingReceipt(orderId);
      
      const response = await apiClient.get(`/user/orders/${orderId}/receipt`);
      if (response && response.data && response.data.html) {
        const { html } = response.data;
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        } else {
          alert('Please allow popups for this site to print receipts.');
        }
      } else {
        throw new Error('No HTML content received');
      }
    } catch (err) {
      console.error('Download receipt error:', err);
      alert(err.response?.data?.error || 'Failed to get receipt.');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  // Filter orders based on item names or order numbers
  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery) return true;
    const matchOrderNum = ord.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchItems = ord.items?.some(item => 
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchOrderNum || matchItems;
  });

  return (
    <div className={styles.orderPageWrapper}>
      <SubPageHeader title="Order Again" />

      {/* Search Bar */}
      <div className={styles.searchBarContainer}>
        <div className={styles.searchInner}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder='Search "coke"' 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <svg className={styles.micIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Order History</h2>

        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p>Loading past orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h3>No orders found</h3>
            <p>{searchQuery ? 'No match found for your search.' : 'Keep shopping to see your order history here!'}</p>
            <button className={styles.shopBtn} onClick={() => navigate(ROUTES.HOME)}>Shop Now</button>
          </div>
        ) : (
          <div className={styles.orderList}>
            {filteredOrders.map((ord) => {
              // Format date nicely
              const orderDate = new Date(ord.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });

              // Combine item names for summary
              const itemSummary = ord.items?.map(i => i.product_name).join(', ') || 'Grocery Items';

              return (
                <div key={ord.id} className={styles.orderCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.orderMeta}>
                      <div className={styles.packageIconWrapper}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.packageIcon}>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                          <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                      </div>
                      <div className={styles.idGroup}>
                        <h4 className={styles.orderId}>ID: {ord.order_number}</h4>
                        <span className={styles.orderDate}>{orderDate}</span>
                      </div>
                    </div>
                    <span className={styles.statusBadge}>
                      <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {ord.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Item Thumbnails Grid */}
                  <div className={styles.itemsRow}>
                    {ord.items?.slice(0, 4).map((item, idx) => {
                      const baseUrl = import.meta.env.VITE_API_BASE_URL 
                        ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
                        : 'http://localhost:3000';
                      
                      let imgSource = item.image_url;
                      if (imgSource && imgSource.includes('media.vegpik.com')) {
                        imgSource = `${baseUrl}/uploads${item.image_url.split('media.vegpik.com')[1]}`;
                      } else if (imgSource && !imgSource.startsWith('http')) {
                        imgSource = `${baseUrl}/${imgSource}`;
                      }

                      return (
                        <div key={idx} className={styles.thumbnailWrapper}>
                          <img 
                            src={imgSource || 'https://via.placeholder.com/80'} 
                            alt={item.product_name} 
                            className={styles.itemThumbnail} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                          />
                          <span className={styles.quantityBadge}>{item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Details */}
                  <div className={styles.summaryDetails}>
                    <p className={styles.itemSummaryText}>{itemSummary}</p>
                    <div className={styles.priceRow}>
                      <span className={styles.totalPaid}>
                        Total Paid: <strong>AED {Number(ord.total_amount).toFixed(2)}</strong>
                      </span>
                      <span className={styles.deliveredToBadge}>
                        Delivered to {ord.address_title || 'Other'}
                      </span>
                    </div>
                  </div>

                  {/* Action Separator */}
                  <hr className={styles.separator} />

                  {/* Card Actions */}
                  <div className={styles.cardActions}>
                    <button 
                      className={styles.viewDetailsBtn} 
                      onClick={() => handleDownloadReceipt(ord.id)}
                      disabled={downloadingReceipt === ord.id}
                    >
                      <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      {downloadingReceipt === ord.id ? 'Loading...' : 'Receipt'}
                    </button>
                    <button 
                      className={styles.orderAgainBtn} 
                      onClick={() => handleOrderAgainAction(ord.items)}
                    >
                      <svg className={styles.refreshIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                      </svg>
                      Order Again
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── MOBILE BOTTOM TAB NAVIGATION ─── */}
      <BottomNav />
    </div>
  );
};

export default OrderAgain;
