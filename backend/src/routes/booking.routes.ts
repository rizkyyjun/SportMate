import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  getUserBookings,
  updateBookingStatus // Add this import
} from '../controllers/booking.controller';

const router = Router();

// Protected routes (all booking operations require authentication)
router.use(authMiddleware);

// Get all bookings (admin only)
router.get('/', getBookings);

// Get user's bookings
router.get('/me', getUserBookings);

// Get specific booking
router.get('/:id', getBookingById);

// Create new booking
router.post('/', createBooking);

// Update booking
router.put('/:id', updateBooking);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

// Update booking status (for admin approval/rejection)
router.patch('/:id/status', updateBookingStatus);

export { router as bookingRoutes };
