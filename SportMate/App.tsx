/**
 * SportMate App
 */

import React from 'react';
import { StatusBar, useColorScheme, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { socketService } from './src/services/socket.service';

const RootNavigator = () => {
  const { user, userToken, isLoading } = useAuth();

  // Connect/disconnect socket based on authentication status
  React.useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isMounted = true;
    let cleanupListener: (() => void) | undefined;

    const setupSocket = async () => {
      try {
        if (user && userToken) {
          // Only connect if not already connected
          if (!socketService.isConnected()) {
            await socketService.connect(userToken);
          }
          
          // Setup reconnection on disconnect
          const handleDisconnect = () => {
            if (!isMounted) return;
            // Try to reconnect after a delay
            reconnectTimer = setTimeout(async () => {
              if (isMounted && user && userToken) {
                await socketService.connect(userToken);
              }
            }, 2000);
          };

          socketService.addListener('disconnect', handleDisconnect);
          cleanupListener = () => {
            socketService.removeListener('disconnect', handleDisconnect);
          };
        } else {
          socketService.disconnect();
        }
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (cleanupListener) cleanupListener();
    };
  }, [user, userToken]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
