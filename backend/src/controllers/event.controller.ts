import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Event } from '../models/event.entity';
import { EventParticipant } from '../models/event-participant.entity';
import { ChatRoom, ChatRoomType } from '../models/chat-room.entity';
import { Field } from '../models/field.entity';

const eventRepository = AppDataSource.getRepository(Event);
const participantRepository = AppDataSource.getRepository(EventParticipant);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
const fieldRepository = AppDataSource.getRepository(Field);

// Get all events with optional filtering and pagination
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sport, date, page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);

    let query = eventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .where('event.isActive = :isActive', { isActive: true });

    if (sport) {
      query = query.andWhere('event.sport = :sport', { sport });
    }

    if (date) {
      query = query.andWhere('event.date = :date', { date });
    }

    const [events, total] = await query
      .skip((parsedPage - 1) * parsedLimit)
      .take(parsedLimit)
      .getManyAndCount();

    res.json({
      data: events,
      total,
      page: parsedPage,
      lastPage: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    console.error('Error in getEvents controller:', error); // Enhanced logging
    next(error);
  }
};

// Get user's events
export const getUserEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await eventRepository.find({
      where: { organizer: { id: req.user!.id } },
      relations: ['participants', 'participants.user'],
      order: { date: 'DESC', time: 'DESC' }
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepository.findOne({
      where: { id: req.params.id },
      relations: ['organizer', 'participants', 'participants.user', 'chatRoom']
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Create event
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, sport, location, date, time, dateTime, maxParticipants, fieldId } = req.body; // Changed 'name' to 'title'

    // Handle dateTime field from frontend (if provided)
    let eventDate = date;
    let eventTime = time;
    
    if (dateTime) {
      const dateObj = new Date(dateTime);
      eventDate = dateObj.toISOString().split('T')[0];
      eventTime = dateObj.toTimeString().split(':')[0] + ':' + dateObj.toTimeString().split(':')[1];
    }

    // Find the field
    const field = await fieldRepository.findOneBy({ id: fieldId });
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Create chat room for the event
    const chatRoom = chatRoomRepository.create({
      type: ChatRoomType.EVENT,
      name: title // Use 'title' for chat room name
    });
    await chatRoomRepository.save(chatRoom);

    // Create event
    const event = eventRepository.create({
      organizer: req.user,
      name: title, // Use 'title' for event name
      description,
      sport,
      location,
      date: eventDate,
      time: eventTime,
      maxParticipants,
      chatRoom,
      field, // Associate the field with the event
      isActive: true
    });

    await eventRepository.save(event);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepository.findOne({
      where: { id: req.params.id },
      relations: ['organizer']
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is authorized to update this event
    if (event.organizer.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await eventRepository.save({
      ...event,
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepository.findOne({
      where: { id: req.params.id },
      relations: ['organizer']
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is authorized to delete this event
    if (event.organizer.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await eventRepository.remove(event);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Join event
export const joinEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepository.findOne({
      where: { id: req.params.id },
      relations: ['participants']
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already a participant
    const existingParticipant = await participantRepository.findOne({
      where: {
        event: { id: event.id },
        user: { id: req.user!.id }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    // Create new participant
    const participant = participantRepository.create({
      user: req.user,
      event,
      isAttending: true,
      notes: req.body.notes
    });

    await participantRepository.save(participant);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
};

// Leave event
export const leaveEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const participant = await participantRepository.findOne({
      where: {
        event: { id: req.params.id },
        user: { id: req.user!.id }
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Not a participant in this event' });
    }

    await participantRepository.remove(participant);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
