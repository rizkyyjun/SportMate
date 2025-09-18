// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  isAdmin?: boolean;
}

// Field types
export interface Field {
  id: string;
  name: string;
  location: string;
  sport: string;
  price: number;
  description: string;
  images: string[];
  contactPhone?: string;
  contactEmail?: string;
  isAvailable: boolean;
  availability: FieldAvailability[];
}

export interface FieldAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  field?: Field;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

// Teammate Request types
export interface TeammateRequest {
  id: string;
  creatorId: string;
  creator?: User; // Added creator object to match backend response
  sport: string;
  location: string;
  date: string;
  time: string;
  description: string;
  isActive: boolean;
  requiredParticipants: number;
  participants: TeammateParticipant[];
  chatRoom?: ChatRoom;
}

export interface TeammateParticipant {
  id: string;
  userId: string;
  requestId: string;
  status: ParticipantStatus;
  message?: string;
  user: User; // Added user relation to include email
}

export enum ParticipantStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Event types
export interface Event {
  id: string;
  name: string;
  description: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  maxParticipants: number;
  isActive: boolean;
  organizerId: string;
  organizer?: User; // Add organizer user object
  participants: EventParticipant[];
  chatRoom?: ChatRoom | null;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  isAttending: boolean;
  notes?: string;
  user: User; // Added user relation
}

// Chat types
export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name?: string;
  participants: User[]; // Ensure participants are always User objects
  messages: Message[];
  otherParticipant?: User; // Add otherParticipant for direct chats
}

export enum ChatRoomType {
  DIRECT = 'direct',
  TEAMMATE = 'teammate',
  EVENT = 'event'
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  timestamp: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}
