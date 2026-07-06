/**
 * API Client Configuration
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data);
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
