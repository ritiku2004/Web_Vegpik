"use client";

import React, { useState, useEffect, Suspense, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SlidersHorizontal, ChevronRight } from 'lucide-react';
import BannerCarousel from '../../components/BannerCarousel';
import ProductCard from '../../components/ProductCard';
import SafeImage from '../../components/SafeImage';
import Loader from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from '../page.module.css';

function CategoriesContent() {
  const { activeAddress, activeShop, serviceAvailable, loading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const catParam = searchParams.get('cat');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDrawer, setShowSortDrawer] = useState(false);

  useEffect(() => {
    setSelectedCategoryId(catParam);
  }, [catParam]);

  const handleCategorySelect = (id) => {
    if (id) {
      navigate(`/categories?cat=${id}`);
    } else {
      navigate(`/categories`);
    }
    setSelectedCategoryId(id);
    setShowMobileSidebar(false);
  };

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: api.getBanners,
  });

  const categoryBanners = banners.filter(
    (b) => b.location === 'category_top' || b.location === 'categorytop' || b.location === 'category' || b.location === 'categories'
  );

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', activeShop?.id],
    queryFn: () => api.getCategories(activeShop?.id),
    enabled: !!activeShop?.id,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['categoryProducts', activeShop?.id, selectedCategoryId],
    queryFn: () => api.getProducts({ shopId: activeShop?.id, categoryId: selectedCategoryId, limit: 100 }),
    enabled: !!activeShop?.id && !!selectedCategoryId,
  });

  const categoryProducts = productsData?.products || [];

  const sortedProducts = React.useMemo(() => {
    let prods = [...categoryProducts];
    if (sortBy === 'price_low_high') {
      prods.sort((a, b) => parseFloat(a.discountPrice || a.price || 0) - parseFloat(b.discountPrice || b.price || 0));
    } else if (sortBy === 'price_high_low') {
      prods.sort((a, b) => parseFloat(b.discountPrice || b.price || 0) - parseFloat(a.discountPrice || a.price || 0));
    } else if (sortBy === 'discount') {
      prods.sort((a, b) => {
        const discA = a.discountPrice ? (parseFloat(a.price) - parseFloat(a.discountPrice)) : 0;
        const discB = b.discountPrice ? (parseFloat(b.price) - parseFloat(b.discountPrice)) : 0;
        return discB - discA;
      });
    }
    return prods;
  }, [categoryProducts, sortBy]);

  const getSortLabel = (type) => {
    switch (type) {
      case 'price_low_high': return 'Low to High';
      case 'price_high_low': return 'High to Low';
      case 'discount': return 'Discounted';
      default: return 'Default';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!activeAddress) {
    return (
      <div className={styles.emptyStateContainer}>
        <span style={{ fontSize: '48px' }}>📍</span>
        <h2 className={styles.emptyStateTitle}>Choose Delivery Location</h2>
        <p className={styles.emptyStateText}>
          Please select or add a saved address to check serviceability and browse category products.
        </p>
        <button className={styles.addAddressBtn} onClick={() => navigate('/addresses')}>
          Add Address
        </button>
      </div>
    );
  }

  if (!serviceAvailable) {
    return (
      <div className={styles.emptyStateContainer}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h2 className={styles.emptyStateTitle}>No Service Available</h2>
        <p className={styles.emptyStateText}>
          We do not deliver to zipcode <strong>{activeAddress.zipcode}</strong>.
        </p>
      </div>
    );
  }

  const isScreenLoading = isLoadingCategories || (selectedCategoryId && isLoadingProducts);

  if (isScreenLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.categoriesPage}>
      {selectedCategoryId === null ? (
        /* "All Categories" view */
        <div className={styles.allCategoriesView}>
          <h2 className={styles.categoriesTitle}>Categories</h2>
          {/* All Categories Grid */}
          <div className={styles.categoriesGrid}>
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => handleCategorySelect(cat.id)}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className={styles.categoryImageWrap}>
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    className={styles.categoryImage}
                  />
                  <div className={styles.categoryImageGlow} />
                </div>
                <span className={styles.categoryName}>{cat.name}</span>

                {/* Mobile List View Info (hidden on desktop) */}
                <div className={styles.categoryListDetails}>
                  <span className={styles.categoryListName}>{cat.name}</span>
                  <span className={styles.categoryListSubtitle}>Explore Products</span>
                </div>
                <div className={styles.categoryListArrow}>
                  <ChevronRight size={18} strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>

          {/* Promo Banner (rendered below categories) */}
          {categoryBanners.length > 0 && (
            <div className={styles.bannersSection} style={{ marginTop: '16px' }}>
              <BannerCarousel banners={categoryBanners} />
            </div>
          )}
        </div>
      ) : (
        /* "Category Products" view */
        <div className={styles.categoryProductsContainer}>
          {/* Custom mobile-only green category header */}
          <div className={styles.customCategoryHeader}>
            <button 
              className={styles.headerBackBtn} 
              onClick={() => handleCategorySelect(null)}
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className={styles.headerTitle}>
              {categories.find((c) => c.id === selectedCategoryId)?.name || 'Products'}
            </h1>
            <button className={styles.headerFilterBtn} aria-label="Filters" onClick={() => setShowMobileSidebar(!showMobileSidebar)}>
              <SlidersHorizontal size={22} />
            </button>
          </div>

          {/* Mobile Sidebar Modal overlay */}
          {showMobileSidebar && (
            <div className={styles.mobileSidebarOverlay} onClick={() => setShowMobileSidebar(false)}>
              <div className={styles.mobileSidebarContent} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.mobileSidebarTitle}>Select Category</h3>
                <div className={styles.mobileSidebarList}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.sidebarBtn} ${selectedCategoryId === cat.id ? styles.activeSidebarBtn : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb back navigation button for Desktop */}
          <button 
            className={styles.backToCategoriesBtn} 
            onClick={() => handleCategorySelect(null)}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to All Categories
          </button>

          <div className={styles.categoryProductsLayout}>
            <aside className={styles.categorySidebar}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.sidebarBtn} ${selectedCategoryId === cat.id ? styles.activeSidebarBtn : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </aside>

            <div className={styles.categoryProductsGrid}>
              <div className={styles.categoryGridHeader}>
                <h3 className={styles.categoryTabTitle} style={{ margin: 0 }}>
                  {categories.find((c) => c.id === selectedCategoryId)?.name || 'Products'}
                </h3>
                <div className={styles.sortDropdownWrapper}>
                  <button 
                    className={styles.sortFilterBtn} 
                    onClick={() => setShowSortDrawer(!showSortDrawer)}
                  >
                    <SlidersHorizontal size={16} />
                    <span>Sort: {getSortLabel(sortBy)}</span>
                  </button>
                  {showSortDrawer && (
                    <div className={styles.desktopSortDropdown}>
                      <button 
                        className={`${styles.dropdownItem} ${sortBy === 'default' ? styles.activeDropdownItem : ''}`}
                        onClick={() => { setSortBy('default'); setShowSortDrawer(false); }}
                      >
                        Default / Popularity
                      </button>
                      <button 
                        className={`${styles.dropdownItem} ${sortBy === 'price_low_high' ? styles.activeDropdownItem : ''}`}
                        onClick={() => { setSortBy('price_low_high'); setShowSortDrawer(false); }}
                      >
                        Price: Low to High
                      </button>
                      <button 
                        className={`${styles.dropdownItem} ${sortBy === 'price_high_low' ? styles.activeDropdownItem : ''}`}
                        onClick={() => { setSortBy('price_high_low'); setShowSortDrawer(false); }}
                      >
                        Price: High to Low
                      </button>
                      <button 
                        className={`${styles.dropdownItem} ${sortBy === 'discount' ? styles.activeDropdownItem : ''}`}
                        onClick={() => { setSortBy('discount'); setShowSortDrawer(false); }}
                      >
                        Discounted Products
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.productsGrid}>
                {sortedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Drawer for Sorting */}
      {showSortDrawer && (
        <div className={styles.drawerOverlay} onClick={() => setShowSortDrawer(false)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Sort & Filter</h3>
              <button className={styles.drawerCloseBtn} onClick={() => setShowSortDrawer(false)}>✕</button>
            </div>
            <div className={styles.drawerList}>
              <button 
                className={`${styles.drawerItem} ${sortBy === 'default' ? styles.activeDrawerItem : ''}`}
                onClick={() => { setSortBy('default'); setShowSortDrawer(false); }}
              >
                <span>Default / Popularity</span>
                {sortBy === 'default' && <span className={styles.checkIcon}>✓</span>}
              </button>
              <button 
                className={`${styles.drawerItem} ${sortBy === 'price_low_high' ? styles.activeDrawerItem : ''}`}
                onClick={() => { setSortBy('price_low_high'); setShowSortDrawer(false); }}
              >
                <span>Price: Low to High</span>
                {sortBy === 'price_low_high' && <span className={styles.checkIcon}>✓</span>}
              </button>
              <button 
                className={`${styles.drawerItem} ${sortBy === 'price_high_low' ? styles.activeDrawerItem : ''}`}
                onClick={() => { setSortBy('price_high_low'); setShowSortDrawer(false); }}
              >
                <span>Price: High to Low</span>
                {sortBy === 'price_high_low' && <span className={styles.checkIcon}>✓</span>}
              </button>
              <button 
                className={`${styles.drawerItem} ${sortBy === 'discount' ? styles.activeDrawerItem : ''}`}
                onClick={() => { setSortBy('discount'); setShowSortDrawer(false); }}
              >
                <span>Discounted Products</span>
                {sortBy === 'discount' && <span className={styles.checkIcon}>✓</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className={styles.emptyStateContainer}><h2>Loading Categories...</h2></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
