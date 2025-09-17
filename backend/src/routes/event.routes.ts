import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  joinEvent,
  leaveEvent
} from '../controllers/event.controller';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(authMiddleware);

router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/me', getUserEvents);
router.post('/:id/join', joinEvent);
router.delete('/:id/leave', leaveEvent);

export { router as eventRoutes };
