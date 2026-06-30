import apiClient from './api';

export const userService = {
  /**
   * Log in user with credentials
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Get currently logged-in user profile details
   */
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  /**
   * Update profile details
   * @param {Object} updateData - User details to update
   */
  updateProfile: async (updateData) => {
    return apiClient.put('/auth/profile', updateData);
  },
};
