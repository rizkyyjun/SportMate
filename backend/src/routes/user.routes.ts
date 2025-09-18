import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getUsers, getUserById, updateUserProfile } from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Get all users (with optional search)
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.put('/profile', updateUserProfile);

export { router as userRoutes };
