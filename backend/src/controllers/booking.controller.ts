import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Booking, BookingStatus } from '../models/booking.entity';
import { Field } from '../models/field.entity';
import { In } from 'typeorm';

const bookingRepository = AppDataSource.getRepository(Booking);
const fieldRepository = AppDataSource.getRepository(Field);

// Get all bookings (admin only)
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingRepository.find({
      relations: ['user', 'field']
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status can be 'confirmed' or 'rejected'

    // Validate status
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Must be "confirmed", "rejected", or "cancelled".' });
    }

    const booking = await bookingRepository.findOne({
      where: { id },
      relations: ['user', 'field']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check for updating booking status
    if (status === BookingStatus.CANCELLED) {
      // Allow user to cancel their own booking
      if (booking.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }
    } else if (status === BookingStatus.CONFIRMED || status === BookingStatus.REJECTED) {
      // Only admins can confirm or reject bookings
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update booking status to ' + status });
      }
    } else {
      // Should not happen due to status validation, but as a fallback
      return res.status(400).json({ message: 'Invalid status update attempt' });
    }

    booking.status = status as BookingStatus;
    booking.updatedAt = new Date();
    await bookingRepository.save(booking);

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingRepository.find({
      where: { user: { id: req.user!.id } },
      relations: ['field'],
      order: { date: 'DESC', startTime: 'DESC' }
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['user', 'field']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// Create new booking
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fieldId, date, startTime, endTime } = req.body;

    // Check if field exists
    const field = await fieldRepository.findOne({ where: { id: fieldId } });
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Check if field is available
    if (!field.isAvailable) {
      return res.status(400).json({ message: 'Field is not available for booking' });
    }

    // Check for conflicting bookings (overlapping time slots for both confirmed and pending)
    const conflictingBookings = await bookingRepository.find({
      where: {
        field: { id: fieldId },
        date,
        status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING])
      }
    });

    // Check for time overlap
    const hasConflict = conflictingBookings.some(booking => {
      // Convert time strings to minutes for comparison
      const newStartMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const newEndMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      const existingStartMinutes = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);
      const existingEndMinutes = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1]);

      // Check if time slots overlap
      return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
    });

    if (hasConflict) {
      return res.status(409).json({ message: 'Field is already booked for this time slot' });
    }

    // Calculate total price (assuming field.price is per hour)
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const hours = endHour - startHour;
    const totalPrice = field.price * hours;

    // Create booking
    const booking = bookingRepository.create({
      user: req.user,
      field,
      date,
      startTime,
      endTime,
      totalPrice,
      status: BookingStatus.PENDING
    });

    await bookingRepository.save(booking);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['user']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to update this booking
    if (booking.user.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Only allow updates if booking is pending
    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({ message: 'Cannot update confirmed or cancelled booking' });
    }

    const updatedBooking = await bookingRepository.save({
      ...booking,
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['user']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Only allow cancellation if booking is not already cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = BookingStatus.CANCELLED;
    await bookingRepository.save(booking);

    res.json(booking);
  } catch (error) {
    next(error);
  }
};
