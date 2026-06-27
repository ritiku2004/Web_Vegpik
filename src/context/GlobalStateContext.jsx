import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

// Create Context
const GlobalStateContext = createContext(undefined);

// Provider Component
export const GlobalStateProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeAddress, setActiveAddress] = useState(null);
  const [activeShop, setActiveShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const [guestId, setGuestId] = useState(() => {
    let id = localStorage.getItem('guest_id');
    // Generate guest ID if user is not logged in and no guest ID exists
    const savedUser = localStorage.getItem('user');
    if (!id && !savedUser) {
      id = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_id', id);
    }
    return id;
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch nearest shop
  const fetchNearestShop = useCallback(async () => {
    try {
      const response = await apiClient.get('/user/shop-inventory/nearest?latitude=23.176&longitude=75.788');
      if (response && response.data) {
        setActiveShop(response.data);
      }
    } catch (e) {
      console.error('Failed to fetch nearest shop:', e);
    }
  }, []);

  // Fetch Addresses
  const fetchAddresses = useCallback(async (currentUserId = null) => {
    const loggedInUser = currentUserId || user?.id;
    if (loggedInUser) {
      try {
        const response = await apiClient.get('/user/auth/addresses');
        if (response && response.data) {
          setAddresses(response.data);
          // Set default address as active if available
          const defaultAddr = response.data.find(addr => addr.is_default) || response.data[0];
          if (defaultAddr) setActiveAddress(defaultAddr);
        }
      } catch (e) {
        console.error('Failed to fetch user addresses:', e);
      }
    } else {
      // Load from local storage for guest
      const localAddrs = JSON.parse(localStorage.getItem('guest_addresses') || '[]');
      setAddresses(localAddrs);
      const defaultAddr = localAddrs.find(addr => addr.is_default) || localAddrs[0];
      if (defaultAddr) setActiveAddress(defaultAddr);
    }
  }, [user]);

  // Fetch Cart
  const fetchCart = useCallback(async (currentUserId = null, currentGuestId = null) => {
    const uId = currentUserId || user?.id;
    const gId = currentGuestId !== undefined ? currentGuestId : guestId;
    const shopId = activeShop?.id;

    if (!uId && !gId) return;

    setCartLoading(true);
    try {
      const params = {};
      if (uId) params.userId = uId;
      else if (gId) params.guestId = gId;
      
      if (shopId) params.shopId = shopId;
      if (activeAddress?.id && !String(activeAddress.id).startsWith('addr_')) {
        params.addressId = activeAddress.id;
      }

      const response = await apiClient.get('/user/cart', { params });
      if (response && response.data) {
        const items = response.data.items || [];
        const mappedItems = items.map(item => ({
          id: item.product_id, // map product_id to id for UI compatibility
          cartItemId: item.id, // backend cart item id
          productId: item.product_id,
          name: item.name,
          price: Number(item.price),
          discountPrice: Number(item.price) - (Number(item.price) * (Number(item.discount_percentage || 0) / 100)),
          unit: `${item.size || ''} ${item.quantity_type || ''}`,
          image: item.image_url,
          quantity: item.quantity,
          stock: 100,
          isAvailable: Number(item.is_available) !== 0,
        }));
        setCart(mappedItems);
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setCartLoading(false);
    }
  }, [user, guestId, activeShop, activeAddress]);

  // Cart Operations
  const addToCart = async (product, quantityChange = 1) => {
    if (!activeShop?.id) return;
    
    // Find if product already in cart
    const existing = cart.find(item => item.id === product.id);
    
    // Optimistic update
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        const newQty = exist.quantity + quantityChange;
        if (newQty <= 0) return prev.filter(item => item.id !== product.id);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      if (quantityChange <= 0) return prev;
      return [...prev, { ...product, quantity: quantityChange }];
    });

    try {
      if (existing) {
        const newQty = existing.quantity + quantityChange;
        if (newQty <= 0) {
          await apiClient.delete(`/user/cart/items/${existing.cartItemId}`);
        } else {
          await apiClient.put(`/user/cart/items/${existing.cartItemId}`, { quantity: newQty });
        }
      } else {
        if (quantityChange > 0) {
          const payload = {
            shopId: activeShop.id,
            productId: product.id,
            quantity: quantityChange
          };
          if (user?.id) payload.userId = user.id;
          else if (guestId) payload.guestId = guestId;

          await apiClient.post('/user/cart/items', payload);
        }
      }
      fetchCart();
    } catch (e) {
      console.error('Failed to modify cart item:', e);
      fetchCart(); // rollback on error
    }
  };

  const removeFromCart = async (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;

    setCart(prev => prev.filter(item => item.id !== productId));

    try {
      await apiClient.delete(`/user/cart/items/${existing.cartItemId}`);
      fetchCart();
    } catch (e) {
      console.error('Failed to remove cart item:', e);
      fetchCart();
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      const params = {};
      if (user?.id) params.userId = user.id;
      else if (guestId) params.guestId = guestId;

      await apiClient.delete('/user/cart', { params });
      fetchCart();
    } catch (e) {
      console.error('Failed to clear cart:', e);
      fetchCart();
    }
  };

  // Address Operations
  const saveAddress = async (addressData) => {
    if (user?.id) {
      try {
        await apiClient.post('/user/auth/addresses', addressData);
        await fetchAddresses();
      } catch (e) {
        console.error('Failed to save address to backend:', e);
      }
    } else {
      // Save locally for guest
      const newAddr = {
        ...addressData,
        id: 'addr_' + Date.now(),
      };
      
      let localAddrs = JSON.parse(localStorage.getItem('guest_addresses') || '[]');
      if (newAddr.is_default) {
        localAddrs = localAddrs.map(a => ({ ...a, is_default: false }));
      }
      localAddrs.push(newAddr);
      localStorage.setItem('guest_addresses', JSON.stringify(localAddrs));
      setAddresses(localAddrs);
      if (newAddr.is_default || !activeAddress) {
        setActiveAddress(newAddr);
      }
    }
  };

  const deleteAddress = async (addressId) => {
    if (user?.id) {
      try {
        await apiClient.delete(`/user/auth/addresses/${addressId}`);
        await fetchAddresses();
      } catch (e) {
        console.error('Failed to delete address from backend:', e);
      }
    } else {
      // Delete locally
      let localAddrs = JSON.parse(localStorage.getItem('guest_addresses') || '[]');
      localAddrs = localAddrs.filter(addr => addr.id !== addressId);
      localStorage.setItem('guest_addresses', JSON.stringify(localAddrs));
      setAddresses(localAddrs);
      if (activeAddress?.id === addressId) {
        setActiveAddress(localAddrs[0] || null);
      }
    }
  };

  // Auth Operations
  const login = async (userData, token) => {
    setLoading(true);
    try {
      const fullUserData = { ...userData, token };
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));

      // Perform migration
      // 1. Merge cart
      if (guestId) {
        try {
          await apiClient.post('/user/cart/merge', { userId: userData.id, guestId });
        } catch (e) {
          console.error('Failed to merge cart:', e);
        }
      }

      // 2. Merge guest addresses
      const localAddresses = JSON.parse(localStorage.getItem('guest_addresses') || '[]');
      if (localAddresses.length > 0) {
        for (const addr of localAddresses) {
          try {
            await apiClient.post('/user/auth/addresses', {
              title: addr.title || 'Other',
              address_line1: addr.address_line1 || '',
              address_line2: addr.address_line2 || '',
              city: addr.city || 'City',
              state: addr.state || 'State',
              latitude: addr.latitude || null,
              longitude: addr.longitude || null,
              is_default: addr.is_default || false,
              receiver_name: addr.receiver_name || userData.first_name || 'User',
              receiver_mobile: addr.receiver_mobile || userData.phone_number || '',
            });
          } catch (e) {
            console.error('Failed to merge guest address:', e);
          }
        }
        localStorage.removeItem('guest_addresses');
      }

      // Clear guestId
      localStorage.removeItem('guest_id');
      setGuestId(null);

      // Fetch final states
      await fetchCart(userData.id, null);
      await fetchAddresses(userData.id);
    } catch (e) {
      console.error('Login process error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
    setAddresses([]);
    setActiveAddress(null);
    
    // Generate new guest ID on logout
    const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guest_id', newGuestId);
    setGuestId(newGuestId);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Initial loads
  useEffect(() => {
    const init = async () => {
      await fetchNearestShop();
      const savedUser = localStorage.getItem('user');
      let parsedUser = null;
      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
      await fetchAddresses(parsedUser?.id);
    };
    init();
  }, [fetchNearestShop]);

  // Load cart when activeShop, activeAddress, user or guestId changes
  useEffect(() => {
    if (activeShop) {
      fetchCart();
    }
  }, [activeShop, activeAddress, user, guestId, fetchCart]);

  const value = {
    user,
    theme,
    cart,
    addresses,
    activeAddress,
    activeShop,
    loading,
    cartLoading,
    guestId,
    login,
    logout,
    toggleTheme,
    addToCart,
    removeFromCart,
    clearCart,
    saveAddress,
    deleteAddress,
    setActiveAddress,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to consume the global state context
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
