import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Field } from '../models/field.entity';
import { Booking, BookingStatus } from '../models/booking.entity'; // Import Booking and BookingStatus
import { In } from 'typeorm'; // Import In for TypeORM queries

const fieldRepository = AppDataSource.getRepository(Field);

// Get all fields with optional filtering
export const getFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sport, location, page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);

    let query = fieldRepository.createQueryBuilder('field');

    if (sport) {
      query = query.where('field.sport = :sport', { sport });
    }

    if (location) {
      query = query.andWhere('field.location ILIKE :location', { location: `%${location}%` });
    }

    const [fields, total] = await query
      .skip((parsedPage - 1) * parsedLimit)
      .take(parsedLimit)
      .getManyAndCount();

    console.log('Successfully fetched fields from database.'); // Log before sending response

    res.json({
      data: fields,
      total,
      page: parsedPage,
      lastPage: Math.ceil(total / parsedLimit),
    });
    console.log('Successfully sent fields response.'); // Log after sending response
  } catch (error) {
    console.error('Error in getFields controller:', error); // Enhanced logging
    next(error);
  }
};

// Get field by ID with availability calculation
export const getFieldById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await fieldRepository.findOne({
      where: { id: req.params.id },
      relations: ['bookings']
    });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Calculate availability for the next 30 days
    const availability = calculateFieldAvailability(field);
    
    // Return field with availability data
    const fieldWithAvailability = {
      ...field,
      availability
    };

    res.json(fieldWithAvailability);
  } catch (error) {
    next(error);
  }
};

// Get bookings for a specific field and user
export const getFieldBookingsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fieldId } = req.params;
    const userId = req.user?.id; // Assuming req.user is populated by authMiddleware

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await AppDataSource.getRepository(Booking)
      .find({
        where: {
          field: { id: fieldId },
          user: { id: userId },
          status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        },
        relations: ['user', 'field'],
      });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate field availability
const calculateFieldAvailability = (field: any) => {
  const availability: any[] = [];
  const today = new Date();
  
  // Generate availability for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Define operating hours (9 AM to 10 PM)
    const operatingHours = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '19:00' },
      { startTime: '19:00', endTime: '20:00' },
      { startTime: '20:00', endTime: '21:00' },
      { startTime: '21:00', endTime: '22:00' }
    ];
    
    // Get bookings for this date (include both confirmed and pending bookings)
    const bookingsForDate = field.bookings?.filter((booking: any) => 
      booking.date === dateString && (booking.status === 'confirmed' || booking.status === 'pending')
    ) || [];
    
    // Create time slots and mark booked ones
    const slots = operatingHours.map((hour, index) => {
      const isBooked = bookingsForDate.some((booking: any) => 
        booking.startTime === hour.startTime && booking.endTime === hour.endTime
      );
      
      return {
        id: `${dateString}-${index}`,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isBooked
      };
    });
    
    availability.push({
      date: dateString,
      slots
    });
  }
  
  return availability;
};

// Create new field
export const createField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if the authenticated user is an Admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can create fields' });
    }

    const { name, location, sport, price, description, images, contactPhone, contactEmail } = req.body;

    const field = fieldRepository.create({
      name,
      location,
      sport,
      price,
      description,
      images,
      contactPhone,
      contactEmail,
      isAvailable: true
    });

    await fieldRepository.save(field);
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

// Update field
export const updateField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await fieldRepository.findOne({ where: { id: req.params.id } });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const updatedField = await fieldRepository.save({
      ...field,
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedField);
  } catch (error) {
    next(error);
  }
};

// Delete field
export const deleteField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await fieldRepository.findOne({ where: { id: req.params.id } });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    await fieldRepository.remove(field);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
