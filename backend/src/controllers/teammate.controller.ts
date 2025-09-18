import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { TeammateRequest } from '../models/teammate-request.entity';
import { TeammateParticipant, ParticipantStatus } from '../models/teammate-participant.entity';
import { ChatRoom, ChatRoomType } from '../models/chat-room.entity';

const teammateRequestRepository = AppDataSource.getRepository(TeammateRequest);
const participantRepository = AppDataSource.getRepository(TeammateParticipant);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);

// Get all teammate requests
export const getTeammateRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sport, date } = req.query;
    let query = teammateRequestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.creator', 'creator')
      .leftJoinAndSelect('request.participants', 'participants')
      .where('request.isActive = :isActive', { isActive: true });

    if (sport) {
      query = query.andWhere('request.sport = :sport', { sport });
    }

    if (date) {
      query = query.andWhere('request.date = :date', { date });
    }

    const requests = await query.orderBy('request.createdAt', 'DESC').getMany();
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// Get user's teammate requests
export const getUserTeammateRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await teammateRequestRepository.find({
      where: { creator: { id: req.user!.id } },
      relations: ['participants', 'participants.user'],
      order: { date: 'DESC', time: 'DESC' }
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// Get teammate request by ID
export const getTeammateRequestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await teammateRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['creator', 'participants', 'participants.user', 'chatRoom', 'chatRoom.participants']
    });

    if (!request) {
      return res.status(404).json({ message: 'Teammate request not found' });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

// Create teammate request
export const createTeammateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sport, location, date, time, dateTime, description, playersNeeded } = req.body; // Changed from requiredParticipants to playersNeeded

    // Handle dateTime field from frontend (if provided)
    let requestDate = date;
    let requestTime = time;
    
    if (dateTime) {
      const dateObj = new Date(dateTime);
      requestDate = dateObj.toISOString().split('T')[0];
      requestTime = dateObj.toTimeString().split(':')[0] + ':' + dateObj.toTimeString().split(':')[1];
    }

    // Create chat room for the request
    const chatRoom = chatRoomRepository.create({
      type: ChatRoomType.TEAMMATE,
      name: `${sport} - ${requestDate} ${requestTime}`,
    });
    await chatRoomRepository.save(chatRoom);

    // Add creator as a participant
    chatRoom.participants = [req.user!];
    await chatRoomRepository.save(chatRoom);

    // Create teammate request
    const request = teammateRequestRepository.create({
      creator: req.user,
      sport,
      location,
      date: requestDate,
      time: requestTime,
      description,
      requiredParticipants: playersNeeded, // Changed to use playersNeeded
      chatRoom,
      isActive: true
    });

    await teammateRequestRepository.save(request);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// Update teammate request
export const updateTeammateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await teammateRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['creator']
    });

    if (!request) {
      return res.status(404).json({ message: 'Teammate request not found' });
    }

    // Check if user is authorized to update this request
    if (request.creator.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const updatedRequest = await teammateRequestRepository.save({
      ...request,
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

// Delete teammate request
export const deleteTeammateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await teammateRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['creator']
    });

    if (!request) {
      return res.status(404).json({ message: 'Teammate request not found' });
    }

    // Check if user is authorized to delete this request
    if (request.creator.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await teammateRequestRepository.remove(request);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Join teammate request
export const joinTeammateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await teammateRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['participants', 'creator'] // Added creator relation to check if user is creator
    });

    if (!request) {
      return res.status(404).json({ message: 'Teammate request not found' });
    }

    // Check if the logged-in user is the creator of the request
    if (request.creator.id === req.user!.id) {
      return res.status(400).json({ message: 'You cannot join your own teammate request.' });
    }

    // Check if user is already a participant
    const existingParticipant = await participantRepository.findOne({
      where: {
        teammateRequest: { id: request.id },
        user: { id: req.user!.id }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'Already joined this request' });
    }

    // Create new participant
    const participant = participantRepository.create({
      user: req.user,
      teammateRequest: request,
      status: ParticipantStatus.PENDING,
      message: req.body.message
    });

    await participantRepository.save(participant);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
};

// Update participant status
export const updateParticipantStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, participantId } = req.params;
    const { status } = req.body;

    const request = await teammateRequestRepository.findOne({
      where: { id: requestId },
      relations: ['creator', 'chatRoom', 'chatRoom.participants']
    });

    if (!request) {
      return res.status(404).json({ message: 'Teammate request not found' });
    }

    // Check if user is authorized to update participant status
    if (request.creator.id !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to update participant status' });
    }

    const participant = await participantRepository.findOne({
      where: { id: participantId },
      relations: ['user']
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = status;
    await participantRepository.save(participant);

    // If participant is approved, add them to the chat room
    if (status === ParticipantStatus.APPROVED) {
      if (request.chatRoom && participant.user) {
        // Add participant only if they are not already in the chat room
        if (!request.chatRoom.participants.some(p => p.id === participant.user.id)) {
          request.chatRoom.participants.push(participant.user);
          await chatRoomRepository.save(request.chatRoom);
        }
      }
    }

    // Re-fetch and save the TeammateRequest to ensure relations are updated
    const updatedRequest = await teammateRequestRepository.findOne({
      where: { id: requestId },
      relations: ['creator', 'participants', 'participants.user', 'chatRoom']
    });

    if (updatedRequest) {
      await teammateRequestRepository.save(updatedRequest);
    }

    res.json(participant);
  } catch (error) {
    next(error);
  }
};

// Leave teammate request
export const leaveTeammateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const participant = await participantRepository.findOne({
      where: {
        teammateRequest: { id: req.params.id },
        user: { id: req.user!.id }
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Not a participant in this request' });
    }

    await participantRepository.remove(participant);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
