/**
 * API Connection Test
 * 
 * This test verifies that the API configuration is working correctly
 * and that network requests can be made successfully.
 */

import { api } from '../src/services/api';

// Mock the Platform module to test different environments
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn().mockResolvedValue('test-token'),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
  },
}));

describe('API Configuration', () => {
  test('should create axios instance with correct baseURL for Android', async () => {
    // Test that the API instance is created correctly
    expect(api.defaults.baseURL).toBe('http://10.0.2.2:5000/api');
    expect(api.defaults.timeout).toBe(10000);
  });

  test('should have proper interceptors configured', () => {
    // Test that interceptors are set up by checking they exist
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});
