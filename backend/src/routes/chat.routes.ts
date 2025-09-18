import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getChatRooms,
  getChatRoomDetails,
  getChatRoomMessages,
  createChatRoom,
  createDirectChatRoom,
  addParticipantToChatRoom,
  removeParticipantFromChatRoom
} from '../controllers/chat.controller';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// Get all chat rooms for the authenticated user
router.get('/rooms', getChatRooms);

// Get chat room details by ID
router.get('/rooms/:roomId', getChatRoomDetails);

// Create a general chat room
router.post('/rooms', createChatRoom);

// Get messages for a specific chat room
router.get('/rooms/:roomId/messages', getChatRoomMessages);

// Create a direct chat room with another user
router.post('/rooms/direct/:userId', createDirectChatRoom);

// Add a participant to a chat room (e.g., for group chats, though not fully implemented yet)
router.post('/rooms/:roomId/participants/:userId', addParticipantToChatRoom);

// Remove a participant from a chat room
router.delete('/rooms/:roomId/participants/:userId', removeParticipantFromChatRoom);

export { router as chatRoutes };
