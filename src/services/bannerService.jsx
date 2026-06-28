import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const bannerService = {
  getBanners: async () => {
    const res = await apiClient.get(API_ENDPOINTS.BANNERS);
    console.log("API Banners Response:", res);
    if (res && res.success) {
      return (res.data || []).map(b => ({
        id: b.id.toString(),
        title: b.title,
        subtitle: b.subtitle || '',
        description: b.description || '',
        image: b.image_url ? b.image_url.replace('http://', 'https://') : null,
        backgroundColor: b.background_color,
        textColor: b.text_color,
        location: b.location
      }));
    }
    return [];
  }
};
