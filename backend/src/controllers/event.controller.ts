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
      .orderBy('event.createdAt', 'DESC')
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
      console.log('createEvent: Function entered.');
      console.log('createEvent: Raw req.body:', req.body);
      console.log('createEvent: req.user:', req.user);

      const { title, description, sport, location, date, time, dateTime, maxParticipants, fieldId } = req.body;
      console.log('createEvent: Destructured request body:', { title, description, sport, location, date, time, dateTime, maxParticipants, fieldId });

      if (!req.user) {
        console.warn('createEvent: Unauthorized attempt to create event.');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Use date and time directly from req.body if available, otherwise parse dateTime
      let eventDate = date;
      let eventTime = time;

      if (dateTime && !date && !time) { // Only parse dateTime if date and time are not explicitly provided
        const dateObj = new Date(dateTime);
        if (isNaN(dateObj.getTime())) {
          console.error('createEvent: Invalid dateTime provided:', dateTime);
          return res.status(400).json({ message: 'Invalid date and time format.' });
        }
        // Extract date in YYYY-MM-DD format (UTC)
        eventDate = dateObj.toISOString().split('T')[0];
        // Extract time in HH:MM format (UTC)
        eventTime = dateObj.getUTCHours().toString().padStart(2, '0') + ':' + dateObj.getUTCMinutes().toString().padStart(2, '0');
      } else if (date && time) {
        // If date and time are explicitly provided, use them directly
        eventDate = date;
        eventTime = time;
      } else {
        // If neither dateTime nor explicit date/time are sufficient, return error
        return res.status(400).json({ message: 'Date and time are required.' });
      }
      console.log('createEvent: Final eventDate:', eventDate, 'eventTime:', eventTime);

      // Find the field if fieldId is provided
      let field = null;
      if (fieldId) {
        field = await fieldRepository.findOneBy({ id: fieldId });
        if (!field) {
          console.warn('createEvent: Field not found for ID:', fieldId);
          return res.status(404).json({ message: 'Field not found' });
        }
        console.log('createEvent: Found field:', field.name);
      }

      // Create chat room for the event
      const chatRoom = chatRoomRepository.create({
        type: ChatRoomType.EVENT,
        name: title, // Use event title as chat room name
        participants: [req.user], // Organizer is the first participant
      });
      console.log('createEvent: Created chatRoom object:', chatRoom);
      await chatRoomRepository.save(chatRoom);
      console.log('createEvent: Saved chatRoom to database.');

      const event = eventRepository.create({
        organizer: req.user,
        name: title,
        description,
        sport,
        location,
        date: eventDate,
        time: eventTime,
        maxParticipants,
        field: field || undefined, // Only set field if it exists
        isActive: true,
        chatRoom: chatRoom, // Associate the created chat room with the event
      });
      console.log('createEvent: Created event object:', event);

      await eventRepository.save(event);
      console.log('createEvent: Saved event to database.');

      // Removed adding organizer as an event participant as per user request.
      // The chat room is already created and associated with the event.

      res.status(201).json(event);
      console.log('createEvent: Event created successfully, response sent.');
    } catch (error) {
      console.error('Error in createEvent controller:', error);
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
      relations: ['participants', 'organizer', 'chatRoom'] // Include chatRoom relation
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent organizer from joining their own event
    if (event.organizer.id === req.user!.id) {
      return res.status(400).json({ message: 'Event organizer cannot join their own event' });
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

    // Add user to the chat room participants
    if (event.chatRoom) {
      const chatRoom = await chatRoomRepository.findOne({
        where: { id: event.chatRoom.id },
        relations: ['participants'],
      });
      if (chatRoom) {
        // Add user if not already in the chat room
        const isUserInChat = chatRoom.participants.some(p => p.id === req.user!.id);
        if (!isUserInChat) {
          chatRoom.participants.push(req.user!);
          await chatRoomRepository.save(chatRoom);
        }
      }
    }
    
    res.status(201).json({
      message: 'Successfully joined the event.',
      participant,
    });
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
