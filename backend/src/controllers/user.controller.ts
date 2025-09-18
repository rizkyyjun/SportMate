import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/user.entity';

const userRepository = AppDataSource.getRepository(User);

// Get all users (for chat search)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user?.id; // Get current user ID from auth middleware
    
    let query = userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email']);

    // Exclude the current user from results (can't chat with yourself)
    if (currentUserId) {
      query = query.where('user.id != :currentUserId', { currentUserId });
    }

    if (search && typeof search === 'string') {
      query = query.andWhere('user.name ILIKE :search OR user.email ILIKE :search', { 
        search: `%${search}%` 
      });
    }

    const users = await query.getMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, profilePicture } = req.body;
    const userId = req.user!.id;

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.profilePicture = profilePicture || user.profilePicture;

    await userRepository.save(user);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
