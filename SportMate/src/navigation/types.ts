import { Field, User } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FieldDetails: { fieldId: string };
  BookingConfirmation: { field: Field; date: string; startTime: string; endTime: string };
  BookingDetails: { bookingId: string };
  MyBookings: undefined;
  TeammateRequestList: undefined;
  TeammateDetails: { requestId: string };
  EventList: undefined;
  EventDetails: { eventId: string };
  EventCreation: undefined;
  Chat: undefined;
  ChatRoom: { roomId: string; title: string; otherParticipant?: User };
  Profile: undefined;
  TeammateRequest: undefined;
  NewChat: undefined;
  CreateFieldScreen: undefined; // Added for the new feature
};

export type MainTabParamList = {
  Home: undefined;
  Teammates: undefined;
  Events: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
