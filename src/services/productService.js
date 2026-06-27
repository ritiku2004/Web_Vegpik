import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const productService = {
  getProducts: async (params = {}) => {
    const res = await apiClient.get(API_ENDPOINTS.PRODUCTS);
    if (res && res.success) {
      let products = (res.data || []).map(p => {
        const mrp = Number(p.mrp_price) || 0;
        const discountPct = Number(p.discount_percentage) || 0;
        const discountedPrice = discountPct > 0 ? Math.round((mrp - (mrp * discountPct / 100)) * 100) / 100 : null;

        return {
          id: String(p.id),
          name: p.name,
          description: p.description || '',
          brand: p.brand || '',
          price: mrp,
          discountPrice: discountedPrice,
          unit: `${p.quantity || ''} ${p.quantity_type || ''}`.trim(),
          stock: 50,
          image: p.image_url || null,
          categoryId: String(p.category_id),
          categoryName: p.category_name || '',
          discountPercentage: discountPct,
          sku: p.sku || '',
          isActive: p.is_active !== false,
          isAvailable: p.is_available !== false,
          type: p.type || 'general',
        };
      }).filter(p => p.isActive);

      if (params.categoryId) {
        products = products.filter(p => p.categoryId === String(params.categoryId));
      }

      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return products;
    }
    return [];
  },

  getProductById: async (id) => {
    const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    if (res && res.success && res.data) {
      const p = res.data;
      const mrp = Number(p.mrp_price) || 0;
      const discountPct = Number(p.discount_percentage) || 0;
      const discountedPrice = discountPct > 0 ? Math.round((mrp - (mrp * discountPct / 100)) * 100) / 100 : null;

      return {
        id: String(p.id),
        name: p.name,
        description: p.description || '',
        brand: p.brand || '',
        price: mrp,
        discountPrice: discountedPrice,
        unit: `${p.quantity || ''} ${p.quantity_type || ''}`.trim(),
        stock: 50,
        image: p.image_url || null,
        categoryId: String(p.category_id),
        categoryName: p.category_name || '',
        discountPercentage: discountPct,
        sku: p.sku || '',
        isActive: p.is_active !== false,
        isAvailable: p.is_available !== false,
        type: p.type || 'general',
      };
    }
    return null;
  }
};
