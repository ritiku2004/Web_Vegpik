import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGlobalState } from '../../context/GlobalStateContext';
import { categoryService } from '../../services/categoryService';
import { bannerService } from '../../services/bannerService';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { ROUTES } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import logoImg from '../../assets/logo.png';
import bannerBagImg from '../../assets/grocery_banner_bag.png';
import categoryPlaceholder from '../../assets/category_placeholder.png';
import styles from './Categories.module.css';

const fallbackCategories = [
  { id: '1', name: 'Grocery' },
  { id: '2', name: 'Vegetables' },
  { id: '3', name: 'Fruits' },
  { id: '4', name: 'Snacks' },
  { id: '5', name: 'Dairy Products' },
  { id: '6', name: 'Cold Drinks' },
];

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCatId = searchParams.get('cat');

  const { cart, addToCart, removeFromCart, user, logout } = useGlobalState();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [nearestShop, setNearestShop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const DEFAULT_LAT = 23.176;
  const DEFAULT_LON = 75.788;

  useEffect(() => {
    const fetchCategoriesData = async () => {
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
          setCategories(fallbackCategories);
        }
      } catch (e) {
        console.error('Failed to fetch categories, using fallbacks', e);
        setCategories(fallbackCategories);
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
        setProducts(fetchedProducts);
      } catch (e) {
        console.error('Failed to fetch products', e);
      }

      setLoading(false);
    };

    fetchCategoriesData();
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

  const cartTotalQuantity = cart.reduce((acc, c) => acc + c.quantity, 0);

  const formatETA = (mins) => {
    if (!mins) return '14 MINS';
    return `${mins} MINS`;
  };

  // Filter products by active category
  const activeProducts = products.filter(
    (p) => String(p.categoryId) === String(activeCatId)
  );

  const activeCategory = categories.find(
    (c) => String(c.id) === String(activeCatId)
  );
  
  const activeCatName = activeCategory ? activeCategory.name : 'Category';

  const defaultBanners = [
    {
      id: 'default_b1',
      title: 'Organic & Natural Choices',
      subtitle: 'HEALTHY PRODUCTS FOR EVERY HOME',
      description: 'Discover fresh organic produce and natural grocery essentials.',
      image: bannerBagImg,
      backgroundColor: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      textColor: '#15803d'
    }
  ];

  const homeTopBanners = banners.filter(
    (b) => b.location === 'home_top' || b.location === 'hometop'
  );
  
  const displayTopBanners = homeTopBanners.length > 0 ? homeTopBanners : defaultBanners;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayTopBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === displayTopBanners.length - 1 ? 0 : prev + 1));
  };

  const activeBanner = displayTopBanners[currentSlide] || displayTopBanners[0];

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      
      {/* ─── MOBILE ONLY ACTIVE CATEGORY DETAIL HEADER ─── */}
      {activeCatId && (
        <header className={`${styles.greenHeader} ${styles.detailHeaderMobileOnly}`}>
          <div className={styles.mobileDetailHeaderContent}>
            <button className={styles.mobileHeaderBackBtn} onClick={() => navigate(ROUTES.CATEGORIES)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h1 className={styles.mobileHeaderTitle}>{activeCatName}</h1>
            <button className={styles.mobileFilterBtn} aria-label="Filter products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                <line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="8" x2="14" y2="8" />
                <line x1="18" y1="16" x2="22" y2="16" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* ─── STANDARD HEADER (DESKTOP ALWAYS, MOBILE WHEN NO ACTIVE CAT) ─── */}
      <header className={`${styles.greenHeader} ${activeCatId ? styles.standardHeaderDesktopOnly : ''}`}>
        <div className={styles.headerContainer}>
          {/* Logo Section */}
          <div className={styles.logoSection} onClick={() => navigate(ROUTES.HOME)}>
            <img src={logoImg} alt="Vegpik Logo" className={styles.appLogo} />
            <span className={styles.logoText}>Vegpik</span>
          </div>

          {/* Delivery ETA Pill */}
          <div className={styles.deliveryPill}>
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

          {/* Actions */}
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
                  {user.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" className={styles.avatarImg} />
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

      {/* ─── MAIN RESPONSIVE CONTAINER ─── */}
      <div className={styles.mainContent}>
        
        {!activeCatId ? (
          /* ========================================================================= */
          /* VIEW A: LIST / GRID OF CATEGORIES                                         */
          /* ========================================================================= */
          <>
            {/* Desktop Page Title */}
            <div className={styles.desktopTitleSection}>
              <h2 className={styles.pageTitle}>Categories</h2>
            </div>

            {/* Desktop grid */}
            <section className={styles.desktopGridSection}>
              <div className={styles.desktopCategoriesGrid}>
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={styles.desktopCategoryCard}
                    onClick={() => navigate(`${ROUTES.CATEGORIES}?cat=${cat.id}`)}
                  >
                    <div className={styles.desktopCategoryImageContainer}>
                      <img 
                        src={cat.image || categoryPlaceholder} 
                        alt={cat.name} 
                        className={styles.desktopCategoryImage} 
                      />
                    </div>
                    <div className={styles.desktopCategoryNameContainer}>
                      <span className={styles.desktopCategoryName}>{cat.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Mobile banner */}
            <section className={styles.bannerSection}>
              <div 
                className={styles.promoBanner}
                style={{ 
                  background: activeBanner.backgroundColor || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  color: activeBanner.textColor || 'inherit'
                }}
              >
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

                <button className={`${styles.navArrow} ${styles.navArrowRight}`} aria-label="Next Slide" onClick={handleNextSlide}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
              
              <div className={styles.carouselIndicators}>
                {displayTopBanners.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </section>

            {/* Mobile list */}
            <section className={styles.mobileListSection}>
              <div className={styles.categoriesContainer}>
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={styles.categoryRowCard}
                    onClick={() => navigate(`${ROUTES.CATEGORIES}?cat=${cat.id}`)}
                  >
                    <div className={styles.categoryRowImageWrapper}>
                      <img 
                        src={cat.image || categoryPlaceholder} 
                        alt={cat.name} 
                        className={styles.categoryRowImage} 
                      />
                    </div>
                    <div className={styles.categoryRowTextCol}>
                      <h3 className={styles.categoryRowTitle}>{cat.name}</h3>
                      <span className={styles.categoryRowSubtitle}>Explore Products</span>
                    </div>
                    <div className={styles.categoryRowArrowWrapper}>
                      <div className={styles.categoryRowChevron}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* ========================================================================= */
          /* VIEW B: CATEGORY DETAIL SIDEBAR + PRODUCT GRID VIEW                       */
          /* ========================================================================= */
          <div className={styles.detailViewWrapper}>
            
            {/* Desktop Back Button Bar */}
            <div className={styles.detailTitleBar}>
              <button 
                className={styles.backBtn}
                onClick={() => navigate(ROUTES.CATEGORIES)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to All Categories
              </button>
            </div>

            {/* Sidebar + Products Grid Container */}
            <div className={styles.detailLayoutContainer}>
              
              {/* Sidebar: Categories Pill list */}
              <aside className={styles.sidebarColumn}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.sidebarItem} ${
                      String(cat.id) === String(activeCatId) ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => navigate(`${ROUTES.CATEGORIES}?cat=${cat.id}`)}
                  >
                    {cat.name}
                  </button>
                ))}
              </aside>

              {/* Products list */}
              <div className={styles.productsListColumn}>
                <div className={styles.categoryDetailTitleSection}>
                  <h2 className={styles.detailPageTitle}>{activeCatName}</h2>
                </div>

                {activeProducts.length === 0 ? (
                  <div className={styles.emptyProducts}>
                    No products found in this category.
                  </div>
                ) : (
                  <div className={styles.detailProductsGrid}>
                    {activeProducts.map((prod) => (
                      <div key={prod.id} className={styles.detailProductCardWrapper}>
                        <ProductCard
                          product={prod}
                          cartQuantity={getCartQuantity(prod.id)}
                          onIncrement={() => handleIncrement(prod)}
                          onDecrement={() => handleDecrement(prod)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* ─── MOBILE BOTTOM TABS ─── */}
      <div className={styles.bottomTabs}>
        <button className={styles.tabItem} onClick={() => navigate(ROUTES.HOME)}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className={styles.tabLabel}>Home</span>
        </button>
        <button 
          className={`${styles.tabItem} ${styles.tabItemActive}`} 
          onClick={() => navigate(ROUTES.CATEGORIES)}
        >
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className={styles.tabLabel}>Categories</span>
        </button>
        <button className={styles.tabItem} onClick={() => navigate(ROUTES.CART)}>
          <div className={styles.cartIconWrapper}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartTotalQuantity > 0 && (
              <span className={styles.cartBadge}>{cartTotalQuantity}</span>
            )}
          </div>
          <span className={styles.tabLabel}>Cart</span>
        </button>
        <button className={styles.tabItem}>
          <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span className={styles.tabLabel}>Order Again</span>
        </button>
      </div>
    </div>
  );
};

export default Categories;
