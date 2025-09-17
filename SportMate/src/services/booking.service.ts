import { api } from './api';
import { Booking, BookingResponse } from '../types';

export const bookingService = {
  createBooking: async (bookingData: {
    fieldId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<BookingResponse> => {
    try {
      const response = await api.post('/bookings', bookingData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      // Return error information instead of throwing
      if (error.response?.status === 400) {
        return { success: false, message: 'This time slot is already booked. Please select another time.' };
      } else if (error.response?.status === 404) {
        return { success: false, message: 'Field not found. Please try again.' };
      } else if (error.response?.status === 409) {
        return { success: false, message: 'This time slot is already booked by another user. Please select another time.' };
      }
      return { success: false, message: 'Failed to create booking. Please try again later.' };
    }
  },

  getUserBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  },

  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error);
    throw error;
    }
  },

  // Get all bookings (for admin review)
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings'); // Assuming an endpoint to get all bookings
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all bookings:', error);
      throw error;
    }
  },

  // Update booking status (for admin approval/rejection)
  updateBookingStatus: async (id: string, status: 'confirmed' | 'rejected' | 'cancelled'): Promise<Booking> => {
    try {
      const response = await api.patch(`/bookings/${id}/status`, { status }); // Changed to PATCH
      return response.data;
    } catch (error) {
      console.error(`Failed to update booking ${id} status to ${status}:`, error);
      throw error;
    }
  },
};
