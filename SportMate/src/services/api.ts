import axios from 'axios';
import { Platform } from 'react-native';

// Determine the base URL based on the platform
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access host machine
    return 'http://10.0.2.2:5000/api';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost works
    return 'http://localhost:5000/api';
  } else {
    // For web or other platforms
    return 'http://localhost:5000/api';
  }
};

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.status, error.response.data);
      // Return the error response instead of rejecting for specific cases
      // This allows individual services to handle errors gracefully
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);
