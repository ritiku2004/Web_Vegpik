import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const categoryService = {
  getCategories: async (shopId) => {
    const url = shopId ? `${API_ENDPOINTS.CATEGORIES}?shopId=${shopId}` : API_ENDPOINTS.CATEGORIES;
    const res = await apiClient.get(url);
    if (res && res.success) {
      return (res.data || []).map(cat => ({
        id: String(cat.id),
        name: cat.name,
        image: cat.image_url,
        description: cat.description,
        sequence: cat.sequence,
      }));
    }
    return [];
  }
};
