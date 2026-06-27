// Application Route Definitions
export const ROUTES = {
  HOME: '/',
  CATEGORIES: '/categories',
  CART: '/cart',
  LOGIN: '/login',
  ABOUT: '/about',
  SERVICES: '/services',
  CONTACT: '/contact',
  PROFILE: '/profile',
  NOT_FOUND: '*',
};

// API Endpoint Mappings
export const API_ENDPOINTS = {
  LOGIN: '/user/auth/login',
  REGISTER: '/user/auth/register',
  PROFILE: '/user/auth/profile',
  CATEGORIES: '/user/catalog/categories',
  BANNERS: '/user/catalog/banners',
  PRODUCTS: '/user/catalog/products',
  NEAREST_SHOP: '/user/catalog/nearest-shop',
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'user',
  APP_THEME: 'theme',
  SHOPPING_CART: 'cart',
};

// Standard Message Constants
export const MESSAGES = {
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network connection lost. Check your internet connectivity.',
  SUCCESS_SUBSCRIBE: 'Thank you for subscribing to Vegpik!',
};
