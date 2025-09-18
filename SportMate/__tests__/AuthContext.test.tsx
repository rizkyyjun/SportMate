import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import { socketService } from '../src/services/socket.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../src/types';

// Mock the socketService
jest.mock('../src/services/socket.service', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  profilePicture: undefined,
  isAdmin: false,
};

describe('AuthContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call socketService.connect on login', async () => {
    let authContextValue: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            authContextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await authContextValue.login('test-token', mockUser);
    });

    expect(socketService.connect).toHaveBeenCalledWith('test-token');
  });

  it('should call socketService.disconnect on logout', async () => {
    let authContextValue: any;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            authContextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await authContextValue.login('test-token', mockUser);
    });

    await act(async () => {
      await authContextValue.logout();
    });

    expect(socketService.disconnect).toHaveBeenCalled();
  });

  it('should call socketService.connect on initial load if token exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-token');

// Mock api call
const mockApi = require('../src/services/api').api;
mockApi.get = jest.fn().mockResolvedValue({ data: { data: { user: mockUser } } });

    render(
      <AuthProvider>
        <></>
      </AuthProvider>
    );

    await act(async () => {
      // Let the useEffect run
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
    expect(socketService.connect).toHaveBeenCalledWith('test-token');
  });
});
