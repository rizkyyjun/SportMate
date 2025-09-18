import { Request, Response, NextFunction } from 'express';
import { In } from 'typeorm'; // Import In
import { AppDataSource } from '../config/data-source';
import { ChatRoom, ChatRoomType } from '../models/chat-room.entity';
import { Message } from '../models/message.entity';
import { User } from '../models/user.entity';

const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
const messageRepository = AppDataSource.getRepository(Message);
const userRepository = AppDataSource.getRepository(User);

// Get all chat rooms for the authenticated user
export const getChatRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const chatRooms = await chatRoomRepository
      .createQueryBuilder('chatRoom')
      .leftJoin('chatRoom.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .getMany();

    // Now load full relations for these chat rooms
    const chatRoomIds = chatRooms.map(room => room.id);
    const fullChatRooms = await chatRoomRepository.find({
      where: { id: In(chatRoomIds) },
      relations: ['participants', 'messages'],
      order: {
        messages: {
          createdAt: 'DESC',
        },
      },
    });

    res.json(fullChatRooms);
  } catch (error) {
    next(error);
  }
};

// Get messages for a specific chat room
export const getChatRoomMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const { before, limit = 50 } = req.query;

    const query = messageRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.room.id = :roomId', { roomId })
      .orderBy('message.createdAt', 'DESC')
      .take(Number(limit));

    if (before) {
      query.andWhere('message.createdAt < :before', { before: new Date(String(before)) });
    }

    const messages = await query.getMany();
    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat room messages:', error);
    next(error);
  }
};

// Create a general chat room
export const createChatRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, participantIds } = req.body;
    const currentUser = req.user!;

    // Validate that participantIds is an array
    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'participantIds must be an array' });
    }

    // Create new chat room
    const chatRoom = chatRoomRepository.create({
      type: participantIds.length === 1 ? ChatRoomType.DIRECT : ChatRoomType.EVENT, // or TEAMMATE based on context
      name: name || null
    });
    await chatRoomRepository.save(chatRoom);

    // Add participants
    const participantIdsWithCurrent = [...new Set([...participantIds, currentUser.id])]; // Ensure current user is included and no duplicates
    const participants = await userRepository.findByIds(participantIdsWithCurrent);
    
    if (participants.length !== participantIdsWithCurrent.length) {
      // Some users were not found
      return res.status(404).json({ message: 'One or more users not found' });
    }

    chatRoom.participants = participants;
    await chatRoomRepository.save(chatRoom);

    res.status(201).json(chatRoom);
  } catch (error) {
    next(error);
  }
};

// Create a direct chat room with another user
export const createDirectChatRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user!;

    // Check if direct chat room already exists
    const existingChatRoom = await chatRoomRepository
      .createQueryBuilder('chatRoom')
      .leftJoin('chatRoom.participants', 'participant')
      .where('chatRoom.type = :type', { type: ChatRoomType.DIRECT })
      .andWhere('participant.id IN (:...userIds)', { userIds: [currentUser.id, userId] })
      .groupBy('chatRoom.id')
      .having('COUNT(DISTINCT participant.id) = 2')
      .getOne();

    if (existingChatRoom) {
      return res.status(200).json(existingChatRoom);
    }

    // Create new chat room
    const chatRoom = chatRoomRepository.create({
      type: ChatRoomType.DIRECT,
      name: null
    });
    await chatRoomRepository.save(chatRoom);

    // Add participants
    const targetUser = await userRepository.findOne({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    chatRoom.participants = [currentUser, targetUser];
    await chatRoomRepository.save(chatRoom);

    res.status(201).json(chatRoom);
  } catch (error) {
    next(error);
  }
};

// Add a participant to a chat room
export const addParticipantToChatRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, userId } = req.params;

    const chatRoom = await chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants']
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const userToAdd = await userRepository.findOne({ where: { id: userId } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a participant
    if (chatRoom.participants.some(p => p.id === userToAdd.id)) {
      return res.status(400).json({ message: 'User is already a participant' });
    }

    chatRoom.participants.push(userToAdd);
    await chatRoomRepository.save(chatRoom);

    res.json(chatRoom);
  } catch (error) {
    next(error);
  }
};

// Remove a participant from a chat room
export const removeParticipantFromChatRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, userId } = req.params;

    const chatRoom = await chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants']
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Remove participant
    chatRoom.participants = chatRoom.participants.filter(p => p.id !== userId);
    await chatRoomRepository.save(chatRoom);

    // If no participants left, delete the chat room and its messages
    if (chatRoom.participants.length === 0) {
      await messageRepository.delete({ room: chatRoom }); // Delete associated messages
      await chatRoomRepository.remove(chatRoom); // Delete the chat room
      return res.status(204).send(); // No content to send back
    }

    res.json(chatRoom);
  } catch (error) {
    next(error);
  }
};
