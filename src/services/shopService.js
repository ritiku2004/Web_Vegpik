import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const shopService = {
  getNearestShop: async (latitude, longitude) => {
    const res = await apiClient.get(`${API_ENDPOINTS.NEAREST_SHOP}?latitude=${latitude}&longitude=${longitude}`);
    if (res && res.success) {
      return res.data;
    }
    return null;
  },

  getShops: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SHOPS);
    if (res && res.success) {
      return res.data || [];
    }
    return [];
  }
};
