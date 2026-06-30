import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ROUTES } from '../../utils/constants';
import { categoryService } from '../../services/categoryService';
import { bannerService } from '../../services/bannerService';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Loader from '../../components/common/Loader/Loader';
import logoImg from '../../assets/logo.png';
import bannerBagImg from '../../assets/grocery_banner_bag.png';
import categoryPlaceholder from '../../assets/category_placeholder.png';
import styles from './Home.module.css';
import BottomNav from '../../components/layout/BottomNav/BottomNav';
const Home = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, user, logout } = useGlobalState();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [nearestShop, setNearestShop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fallback coords for Shastri Nagar, Ujjain
  const DEFAULT_LAT = 23.176;
  const DEFAULT_LON = 75.788;

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      
      // 1. Fetch nearest shop
      try {
        const shop = await shopService.getNearestShop(DEFAULT_LAT, DEFAULT_LON);
        setNearestShop(shop);
      } catch (e) {
        console.error('Failed to get shop details', e);
      }

      // 2. Fetch categories
      try {
        const fetchedCategories = await categoryService.getCategories();
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else {
          setCategories([]);
        }
      } catch (e) {
        console.error('Failed to fetch categories', e);
        setCategories([]);
      }

      // 3. Fetch banners
      try {
        const fetchedBanners = await bannerService.getBanners();
        setBanners(fetchedBanners);
      } catch (e) {
        console.error('Failed to fetch banners', e);
      }

      // 4. Fetch products
      try {
        const fetchedProducts = await productService.getProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
        setProducts([]);
      }

      setLoading(false);
    };

    fetchHomeData();
  }, []);

  const getCartQuantity = (productId) => {
    const item = cart.find((item) => String(item.id) === String(productId));
    return item ? item.quantity : 0;
  };

  const handleIncrement = (product) => {
    addToCart(product);
  };

  const handleDecrement = (product) => {
    const qty = getCartQuantity(product.id);
    if (qty > 1) {
      addToCart({ ...product, quantity: -1 });
    } else {
      removeFromCart(product.id);
    }
  };

  const trendingProducts = products.filter(p => p.type === 'trending');
  const bestDeals = products.filter(p => p.type === 'best deal');

  // 1. Dynamic Banners Mapping (Reference from App)
  const homeTopBanners = banners.filter(
    (b) => b.location === 'home_top' || b.location === 'hometop'
  );
  const homeMiddleBanners = banners.filter(
    (b) => b.location === 'home_middle' || b.location === 'homemiddle'
  );

  const displayTopBanners = homeTopBanners;
  const displayMiddleBanners = homeMiddleBanners;

  const handlePrevSlide = () => {
    if (displayTopBanners.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? displayTopBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (displayTopBanners.length === 0) return;
    setCurrentSlide((prev) => (prev === displayTopBanners.length - 1 ? 0 : prev + 1));
  };

  const activeBanner = displayTopBanners[currentSlide] || displayTopBanners[0] || null;
  const midBanner = displayMiddleBanners[0] || null;

  // 2. Dynamic Categories Mapping (Reference from App)
  const categoriesWithProducts = categories
    .map((cat) => {
      const catProducts = products.filter((p) => String(p.categoryId) === String(cat.id));
      return { ...cat, products: catProducts };
    })
    .filter((cat) => cat.products.length > 0)
    .slice(0, 5);

  const displayedCategories = categories.slice(0, 8);
  const cartTotalQuantity = cart.reduce((acc, c) => acc + c.quantity, 0);

  const formatETA = (mins) => {
    if (!mins) return '14 MINS';
    return `${mins} MINS`;
  };

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader text="Loading fresh groceries..." />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      
      {/* ─── DESKTOP HEADER (EXACT MOCKUP DESIGN) ─── */}
      <header className={styles.greenHeader}>
        <div className={styles.headerContainer}>
          {/* Logo Section */}
          <div className={styles.logoSection}>
            <img src={logoImg} alt="Vegpik Logo" className={styles.appLogo} />
            <span className={styles.logoText}>Vegpik</span>
          </div>

          {/* Delivery ETA Pill */}
          <div className={styles.deliveryPill} onClick={() => navigate(ROUTES.ADDRESS_BOOK)} style={{ cursor: 'pointer' }}>
            <div className={styles.pillLabelContainer}>
              <span className={styles.deliverInLabel}>DELIVER IN</span>
              <span className={styles.deliveryTime}>
                {nearestShop && nearestShop.serviceAvailable 
                  ? formatETA(nearestShop.deliveryETA || 14) 
                  : '14 MINS'}
              </span>
            </div>
            <div className={styles.pillAddressContainer}>
              <span className={styles.addressText}>
                {nearestShop && nearestShop.address
                  ? `Home - ${nearestShop.address}` 
                  : 'Home - 11, Rami nagar...'}
              </span>
              <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder='Search "coke"' 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.micBtn} aria-label="Voice Search">
                <svg className={styles.micIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.headerActions}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <svg className={styles.iconBell} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            
            {user ? (
              <div className={styles.profileContainer}>
                <button 
                  className={styles.profileAvatarBtn} 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Profile menu"
                >
                  {user.profile_picture_url && !avatarError ? (
                    (!user.profile_picture_url.includes('/') && !user.profile_picture_url.includes('.')) ? (
                      <div className={styles.avatarPlaceholder} style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2' }}>
                        {user.profile_picture_url}
                      </div>
                    ) : (
                      <img 
                        src={user.profile_picture_url.includes('media.vegpik.com') 
                          ? `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000'}/uploads${user.profile_picture_url.split('media.vegpik.com')[1]}` 
                          : (user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000'}/${user.profile_picture_url}`)}
                        alt="Profile" 
                        className={styles.avatarImg} 
                        onError={() => setAvatarError(true)}
                      />
                    )
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
                {showProfileMenu && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user.first_name} {user.last_name || ''}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                    <button className={styles.dropdownItemLink} onClick={() => { navigate(ROUTES.PROFILE); setShowProfileMenu(false); }}>
                      My Profile
                    </button>
                    <button className={styles.dropdownItemLink} onClick={() => { navigate('/order-again'); setShowProfileMenu(false); }}>
                      Order Again
                    </button>
                    <button className={styles.dropdownItem} onClick={() => { logout(); setShowProfileMenu(false); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={() => navigate(ROUTES.LOGIN)}>Login</button>
            )}
            
            <button className={styles.cartBtn} onClick={() => navigate(ROUTES.CART)}>
              <div className={styles.cartBtnContent}>
                <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Cart</span>
              </div>
              {cartTotalQuantity > 0 && (
                <span className={styles.cartBadgeHeader}>{cartTotalQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        
        {/* ─── HERO CAROUSEL BANNER (EXACT GREEN DESIGN) ─── */}
        <section className={styles.bannerSection}>
          <div 
            className={styles.promoBanner}
            style={{ 
              background: activeBanner.backgroundColor || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              color: '#166534'
            }}
          >
            {/* Left Nav Arrow */}
            <button className={styles.navArrow} aria-label="Previous Slide" onClick={handlePrevSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

              <div className={styles.bannerLeft}>
                {activeBanner.subtitle && <span className={styles.promoBadge}>{activeBanner.subtitle}</span>}
                <h1 className={styles.bannerHeading}>{activeBanner.title}</h1>
                {activeBanner.description && (
                  <p className={styles.bannerDescription}>{activeBanner.description}</p>
                )}
                <button className={styles.bannerBtn}>Shop Now</button>
              </div>
              
              <div className={styles.bannerRight}>
                <img 
                  src={activeBanner.image || bannerBagImg} 
                  alt={activeBanner.title} 
                  className={styles.groceryBagImage} 
                />
              </div>

              {/* Right Nav Arrow */}
              <button 
                className={`${styles.navArrow} ${styles.navArrowRight}`} 
                aria-label="Next Slide" 
                onClick={handleNextSlide}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            
            {displayTopBanners.length > 1 && (
              <div className={styles.carouselIndicators}>
                {displayTopBanners.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            )}
          </section>
                  {/* ─── TRENDING PRODUCTS ROW ─── */}
        {trendingProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Trending Products</h2>
              <button className={styles.seeAllBtn}>
                See All <span className={styles.arrowIcon}>&rarr;</span>
              </button>
            </div>
            <div className={styles.horizontalScroll}>
              {trendingProducts.map((prod) => (
                <div key={prod.id} className={styles.horizontalCardWrapper}>
                  <ProductCard
                    product={prod}
                    cartQuantity={getCartQuantity(prod.id)}
                    onIncrement={() => handleIncrement(prod)}
                    onDecrement={() => handleDecrement(prod)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── SHOP BY CATEGORY ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            {displayedCategories.length > 0 && (
              <button className={styles.seeAllBtn} onClick={() => navigate(ROUTES.CATEGORIES)}>
                See All <span className={styles.arrowIcon}>&rarr;</span>
              </button>
            )}
          </div>
          {displayedCategories.length === 0 ? (
            <div className={styles.emptyState}>No categories available</div>
          ) : (
            <div className={styles.categoriesGrid}>
              {displayedCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={styles.categoryCard}
                  onClick={() => navigate(`${ROUTES.CATEGORIES}?cat=${cat.id}`)}
                >
                  <div className={styles.categoryImageContainer}>
                    <img src={cat.image || categoryPlaceholder} alt={cat.name} className={styles.categoryImage} />
                  </div>
                  <div className={styles.categoryNameContainer}>
                    <span className={styles.categoryName}>{cat.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── DYNAMIC CATEGORY PRODUCT ROWS ─── */}
        {products.length === 0 ? (
          <section className={styles.section}>
            <div className={styles.emptyState}>No products available</div>
          </section>
        ) : (
          categoriesWithProducts.map((cat, idx) => (
            <React.Fragment key={cat.id}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{cat.name}</h2>
                  <button className={styles.seeAllBtn}>
                    See All <span className={styles.arrowIcon}>&rarr;</span>
                  </button>
                </div>
                <div className={styles.horizontalScroll}>
                  {cat.products.map((prod) => (
                    <div key={prod.id} className={styles.horizontalCardWrapper}>
                      <ProductCard
                        product={prod}
                        cartQuantity={getCartQuantity(prod.id)}
                        onIncrement={() => handleIncrement(prod)}
                        onDecrement={() => handleDecrement(prod)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Mid-page promotional banner: render after 2 category rows (idx === 1) */}
              {idx === 1 && displayMiddleBanners.length > 0 && midBanner && (
              <section className={styles.bannerSection}>
                <div 
                  className={styles.promoBanner}
                  style={{ 
                    background: midBanner.backgroundColor || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                    color: '#166534'
                  }}
                >
                  {/* Left Nav Arrow */}
                  <button className={styles.navArrow} aria-label="Previous Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <div className={styles.bannerLeft}>
                    {midBanner.subtitle && <span className={styles.promoBadge}>{midBanner.subtitle}</span>}
                    <h1 className={styles.bannerHeading}>{midBanner.title}</h1>
                    {midBanner.description && (
                      <p className={styles.bannerDescription}>{midBanner.description}</p>
                    )}
                    <button className={styles.bannerBtn}>Shop Now</button>
                  </div>
                  
                  <div className={styles.bannerRight}>
                    <img 
                      src={midBanner.image || bannerBagImg} 
                      alt={midBanner.title} 
                      className={styles.groceryBagImage} 
                    />
                  </div>

                  {/* Right Nav Arrow */}
                  <button className={`${styles.navArrow} ${styles.navArrowRight}`} aria-label="Next Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                
                <div className={styles.carouselIndicators}>
                  {displayMiddleBanners.map((_, dotIdx) => (
                    <span 
                      key={dotIdx} 
                      className={`${styles.dot} ${displayMiddleBanners.length > 1 ? (dotIdx === 1 ? styles.activeDot : '') : (dotIdx === 0 ? styles.activeDot : '')}`}
                    />
                  ))}
                </div>
              </section>
            )}
            </React.Fragment>
          ))
        )}

        {/* ─── TRENDING PRODUCTS ROW ─── */}

        {/* ─── BEST DEALS ROW ─── */}
        {bestDeals.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Best Deals</h2>
              <button className={styles.seeAllBtn}>
                See All <span className={styles.arrowIcon}>&rarr;</span>
              </button>
            </div>
            <div className={styles.horizontalScroll}>
              {bestDeals.map((prod) => (
                <div key={prod.id} className={styles.horizontalCardWrapper}>
                  <ProductCard
                    product={prod}
                    cartQuantity={getCartQuantity(prod.id)}
                    onIncrement={() => handleIncrement(prod)}
                    onDecrement={() => handleDecrement(prod)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── MOBILE BOTTOM TABS ─── */}
      <BottomNav />

    </div>
  );
};

export default Home;
