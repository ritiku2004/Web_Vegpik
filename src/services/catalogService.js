import { categoryService } from './categoryService';
import { bannerService } from './bannerService';
import { productService } from './productService';
import { shopService } from './shopService';

export const catalogService = {
  getCategories: categoryService.getCategories,
  getBanners: bannerService.getBanners,
  getNearestShop: shopService.getNearestShop,
  getProducts: productService.getProducts,
  getProductById: productService.getProductById,
};
