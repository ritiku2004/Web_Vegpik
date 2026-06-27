import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';

// Pages
import Home from '../pages/Home/Home';
import Categories from '../pages/Categories/Categories';
import Cart from '../pages/Cart/Cart';
import Login from '../pages/Login/Login';
import About from '../pages/About/About';
import Services from '../pages/Services/Services';
import Contact from '../pages/Contact/Contact';
import Profile from '../pages/Profile/Profile';
import NotFound from '../pages/NotFound/NotFound';

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === ROUTES.LOGIN;

  return (
    <>
      {!isLoginPage && <Header />}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.CATEGORIES} element={<Categories />} />
          <Route path={ROUTES.CART} element={<Cart />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.SERVICES} element={<Services />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
};

export default AppRoutes;
