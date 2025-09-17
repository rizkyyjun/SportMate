import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  getFieldBookingsForUser
} from '../controllers/field.controller';

const router = Router();

// Public routes
router.get('/', getFields);
router.get('/:id', getFieldById);
router.get('/:fieldId/bookings/me', authMiddleware, getFieldBookingsForUser); // New route to get user's bookings for a specific field

// Protected routes (require authentication)
router.post('/', authMiddleware, createField);
router.put('/:id', authMiddleware, updateField);
router.delete('/:id', authMiddleware, deleteField);

export { router as fieldRoutes };
