import { ChatRoom, Message, User } from '../types';
import { api } from './api';

export const chatService = {
  // Get all chat rooms for the current user
  getChatRooms: async (currentUserId: string): Promise<ChatRoom[]> => {
    try {
      const response = await api.get('/chat/rooms');
      const chatRooms: ChatRoom[] = response.data;
      
      // For direct chat rooms, identify the other participant
      const processedChatRooms = chatRooms.map(room => {
        if (room.type === 'direct') {
          const otherParticipant = room.participants.find(p => p.id !== currentUserId);
          // Ensure otherParticipant is always set for direct chats, even if name is missing
          if (otherParticipant) {
            return { ...room, otherParticipant: { ...otherParticipant, name: otherParticipant.name || otherParticipant.email } };
          }
        }
        return room;
      });
      return processedChatRooms;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get chat room details by ID
  getChatRoomDetails: async (roomId: string): Promise<ChatRoom> => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for chat room ${roomId}:`, error);
      throw error;
    }
  },

  // Get messages for a specific chat room
  getChatRoomMessages: async (roomId: string, before?: string, limit: number = 50): Promise<Message[]> => {
    try {
      const params: any = { limit };
      if (before) params.before = before;

      const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
      // Process messages to ensure senderId is directly available
      const processedMessages: Message[] = response.data.map((message: any) => ({
        ...message,
        senderId: message.sender?.id || message.senderId,
      }));
      return processedMessages;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },

  // Create a direct chat room with another user
  createDirectChatRoom: async (userId: string): Promise<ChatRoom> => {
    try {
      const response = await api.post(`/chat/rooms/direct/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error creating direct chat with user ${userId}:`, error);
      throw error;
    }
  },

  getUsers: async (search?: string): Promise<User[]> => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createChatRoom: async (data: { name: string; participantIds: string[] }): Promise<ChatRoom> => {
    try {
      const response = await api.post('/chat/rooms', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },
};
