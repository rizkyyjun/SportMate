import { TeammateRequest, TeammateParticipant } from '../types';
import { api } from './api';

export const teammateService = {
  // Get all teammate requests
  getTeammateRequests: async (): Promise<TeammateRequest[]> => {
    try {
      const response = await api.get('/teammates');
      return response.data; // Corrected: Backend returns an array directly, not an object with 'items'
    } catch (error) {
      console.error('Error fetching teammate requests:', error);
      throw error;
    }
  },

  // Get teammate request by ID
  getTeammateRequestById: async (id: string): Promise<TeammateRequest> => {
    try {
      const response = await api.get(`/teammates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching teammate request ${id}:`, error);
      throw error;
    }
  },

  // Create a new teammate request
  createTeammateRequest: async (requestData: {
    sport: string;
    dateTime: string;
    location: string;
    playersNeeded: number;
    description: string;
  }): Promise<TeammateRequest> => {
    try {
      const response = await api.post('/teammates', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating teammate request:', error);
      throw error;
    }
  },

  // Join a teammate request
  joinTeammateRequest: async (id: string): Promise<{ success: boolean; chatRoomId: string }> => {
    try {
      const response = await api.post(`/teammates/${id}/join`);
      return response.data;
    } catch (error) {
      console.error(`Error joining teammate request ${id}:`, error);
      throw error;
    }
  },

  // Update participant status in a teammate request
  updateTeammateParticipantStatus: async (
    requestId: string,
    participantId: string,
    status: string
  ): Promise<TeammateParticipant> => {
    try {
      const response = await api.patch(
        `/teammates/${requestId}/participants/${participantId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating participant status for request ${requestId}:`, error);
      throw error;
    }
  },

  // Leave a teammate request
  leaveTeammateRequest: async (id: string): Promise<void> => {
    try {
      await api.delete(`/teammates/${id}/leave`);
    } catch (error) {
      console.error(`Error leaving teammate request ${id}:`, error);
      throw error;
    }
  },
};
