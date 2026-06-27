import axios from 'axios';

// Get API base URL from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create a centralized Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor (e.g. adding JWT authentication token)
apiClient.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing token from storage', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (centralized error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Simplify response data retrieval
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Server responded with a status code out of the 2xx range
      const status = error.response.status;
      const data = error.response.data;

      if (data && data.message) {
        errorMessage = data.message;
      } else {
        switch (status) {
          case 400:
            errorMessage = 'Bad Request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            // Option: Redirect to login or trigger logout here
            break;
          case 403:
            errorMessage = 'Forbidden. You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Internal Server Error. Please try again later.';
            break;
          default:
            errorMessage = `Error: ${status}`;
        }
      }
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      // Something else happened setting up the request
      errorMessage = error.message;
    }

    console.error('[API Error]:', error);
    
    // We reject with a clean object structure
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status || null,
      originalError: error,
    });
  }
);

export default apiClient;
