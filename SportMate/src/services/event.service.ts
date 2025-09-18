import { Event } from '../types';
import { api } from './api';

export const eventService = {
  // Get all events with pagination
  getEvents: async (page: number = 1, limit: number = 10): Promise<{ data: Event[]; total: number; page: number; lastPage: number }> => {
    try {
      const response = await api.get('/events', { params: { page, limit, relations: ['organizer'] } }); // Include organizer relation
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return empty data on error
      return { data: [], total: 0, page: page, lastPage: 0 };
    }
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData: {
    title: string;
    sport: string;
    location: string;
    fieldId?: string; // Make fieldId optional
    dateTime: string;
    maxParticipants: number;
    description: string;
  }): Promise<Event> => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating event:', error);
      // Enhanced error handling with specific messages
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || 'Failed to create event';
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        throw new Error('Server not responding. Please try again.');
      } else {
        // Request setup error
        throw new Error('Failed to send request. Please check your connection.');
      }
    }
  },

  // Join an event
  joinEvent: async (id: string): Promise<{ success: boolean; chatRoomId: string }> => {
    try {
      const response = await api.post(`/events/${id}/join`);
      return response.data;
    } catch (error) {
      console.error(`Error joining event ${id}:`, error);
      throw error;
    }
  },

  // Leave an event
  leaveEvent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/events/${id}/leave`);
    } catch (error) {
      console.error(`Error leaving event ${id}:`, error);
      throw error;
    }
  },
};
