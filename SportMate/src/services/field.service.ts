import { Field, Booking } from '../types'; // Import Booking
import { api } from './api';

export const fieldService = {
  // Get all fields with pagination
  getFields: async (page: number = 1, limit: number = 100): Promise<{ data: Field[]; total: number; page: number; lastPage: number }> => {
    try {
      const response = await api.get('/fields', { params: { page, limit } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching fields:', error);
      // Return empty data on error
      return { data: [], total: 0, page: page, lastPage: 0 };
    }
  },

  // Get field by ID
  getFieldById: async (id: string): Promise<Field | null> => {
    try {
      const response = await api.get(`/fields/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching field ${id}:`, error);
      // Return null on error instead of throwing
      return null;
    }
  },

  // Get bookings for a specific field and user
  getFieldBookingsForUser: async (fieldId: string): Promise<Booking[]> => {
    try {
      const response = await api.get(`/fields/${fieldId}/bookings/me`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user bookings for field ${fieldId}:`, error);
      return [];
    }
  },

  // Create a new field
  createField: async (fieldData: { name: string; description?: string; images: string[]; location: string; sport: string; price: number; contactPhone?: string; contactEmail?: string }): Promise<Field> => {
    try {
      const response = await api.post('/fields', fieldData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating field:', error);
      throw error; // Re-throw to be handled by the caller
    }
  },
};
