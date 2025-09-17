import { AppDataSource } from '../config/data-source';
import { User } from '../models/user.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError';

export const registerUser = async (name: string, email: string, password_plain: string) => {
  const userRepository = AppDataSource.getRepository(User);

  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password_plain, 10);

  // Create new user
  const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  await userRepository.save(user);

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions
  );

  // Omit password from response
  const { password, ...result } = user;
  return { user: result, token };
};

export const loginUser = async (email: string, password_plain: string) => {
  const userRepository = AppDataSource.getRepository(User);

  // Find user by email
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password_plain, user.password);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions
  );

  // Omit password from response
  const { password, ...result } = user;
  return { user: result, token };
};
