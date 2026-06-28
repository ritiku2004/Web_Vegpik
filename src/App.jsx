import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './context/Providers';
import ConditionalLayout from './components/ConditionalLayout';

// Pages
import HomePage from './pages_next/page';
import AboutPage from './pages_next/about/page';
import AddressesPage from './pages_next/addresses/page';
import CartPage from './pages_next/cart/page';
import CategoriesPage from './pages_next/categories/page';
import CheckoutPage from './pages_next/checkout/page';
import ContactPage from './pages_next/contact/page';
import LoginPage from './pages_next/login/page';
import NotificationsPage from './pages_next/notifications/page';
import OrdersPage from './pages_next/orders/page';
import OrderDetailsPage from './pages_next/orders/[id]/page';
import PrivacyPage from './pages_next/privacy/page';
import ProductDetailsPage from './pages_next/product/[id]/page';
import ProfilePage from './pages_next/profile/page';
import SearchPage from './pages_next/search/page';
import TermsPage from './pages_next/terms/page';

import './styles/index.css';

function App() {
  return (
    <Providers>
      <Router>
        <ConditionalLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </ConditionalLayout>
      </Router>
    </Providers>
  );
}

export default App;
