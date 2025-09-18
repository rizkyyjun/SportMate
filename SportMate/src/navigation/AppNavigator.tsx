import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Field } from '../types';
import type { RootStackParamList } from './types';

// Screens
import FieldListScreen from '../screens/FieldListScreen';
import AdminBookingReviewScreen from '../screens/AdminBookingReviewScreen'; // Import the new screen
import AuthNavigator from './AuthNavigator';
import TeammateRequestListScreen from '../screens/TeammateRequestListScreen';
import EventListScreen from '../screens/EventListScreen';
import EventCreationScreen from '../screens/EventCreationScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import FieldDetailsScreen from '../screens/FieldDetailsScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import TeammateDetailsScreen from '../screens/TeammateDetailsScreen';
import TeammateRequestScreen from '../screens/TeammateRequestScreen';
import NewChatScreen from '../screens/NewChatScreen';
import CreateFieldScreen from '../screens/CreateFieldScreen'; // Import the CreateFieldScreen
import EditProfileScreen from '../screens/EditProfileScreen';


import { AuthStackParamList } from './AuthNavigator';







export type MainTabParamList = {
  Home: undefined;
  Teammates: undefined;
  Events: undefined;
  Chat: undefined;
  Profile: undefined;
};

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

type ScreenOptions = {
  route: { name: keyof MainTabParamList };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screen for screens that haven't been implemented yet
const PlaceholderScreen = () => null;

// Main tab navigator
const MainTabNavigator = () => {
  const screenOptions = ({ route }: ScreenOptions): BottomTabNavigationOptions => ({
    tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
      let iconName: string;

      switch (route.name) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Teammates':
          iconName = focused ? 'people' : 'people-outline';
          break;
        case 'Events':
          iconName = focused ? 'calendar' : 'calendar-outline';
          break;
        case 'Chat':
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          break;
        case 'Profile':
          iconName = focused ? 'person' : 'person-outline';
          break;
        default:
          iconName = 'help-outline';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#0066cc',
    tabBarInactiveTintColor: 'gray',
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Home" 
        component={FieldListScreen} 
        options={{ title: 'Fields' }}
      />
      <Tab.Screen 
        name="Teammates" 
        component={TeammateRequestListScreen} 
        options={{ title: 'Find Teammates' }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventListScreen} 
        options={{ title: 'Events' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main stack navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen 
        name="FieldDetails" 
        component={FieldDetailsScreen} 
        options={{ headerShown: true, title: 'Field Details' }}
      />
      <Stack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen} 
        options={{ headerShown: true, title: 'Booking Confirmation' }}
      />
      <Stack.Screen 
        name="TeammateDetails" 
        component={TeammateDetailsScreen} 
        options={{ headerShown: true, title: 'Teammate Request Details' }}
      />
      <Stack.Screen 
        name="TeammateRequest" 
        component={TeammateRequestScreen} 
        options={{ headerShown: true, title: 'Create Teammate Request' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen} 
        options={{ headerShown: true, title: 'Event Details' }}
      />
      <Stack.Screen 
        name="EventCreation" 
        component={EventCreationScreen} 
        options={{ headerShown: true, title: 'Create Event' }}
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={{ headerShown: true, title: 'Chat' }}
      />
      <Stack.Screen 
        name="NewChat" 
        component={NewChatScreen} 
        options={{ headerShown: true, title: 'New Chat' }}
      />
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen} 
        options={{ headerShown: true, title: 'My Bookings' }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen} 
        options={{ headerShown: true, title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="CreateFieldScreen" 
        component={CreateFieldScreen} 
        options={{ headerShown: true, title: 'Create New Field' }}
      />
      {/* Admin Booking Review Screen */}
      <Stack.Screen 
        name="AdminBookingReview" 
        component={AdminBookingReviewScreen} 
        options={{ headerShown: true, title: 'Booking Review' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: true, title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
