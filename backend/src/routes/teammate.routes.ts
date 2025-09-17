import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getTeammateRequests,
  getTeammateRequestById,
  createTeammateRequest,
  updateTeammateRequest,
  deleteTeammateRequest,
  getUserTeammateRequests,
  joinTeammateRequest,
  updateParticipantStatus,
  leaveTeammateRequest
} from '../controllers/teammate.controller';

const router = Router();

// Protected routes (all teammate operations require authentication)
router.use(authMiddleware);

// Teammate Request routes
router.get('/', getTeammateRequests);
router.get('/me', getUserTeammateRequests);
router.get('/:id', getTeammateRequestById);
router.post('/', createTeammateRequest);
router.put('/:id', updateTeammateRequest);
router.delete('/:id', deleteTeammateRequest);

// Participant routes
router.post('/:id/join', joinTeammateRequest);
router.patch('/:requestId/participants/:participantId/status', updateParticipantStatus);
router.delete('/:id/leave', leaveTeammateRequest);

export { router as teammateRoutes };
