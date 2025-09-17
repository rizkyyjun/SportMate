import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config(); // Load environment variables

interface DecodedToken {
  id: string;
  email: string;
  // Add other properties if your JWT payload contains them
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    (socket as any).user = decoded; // Attach user information to the socket object
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
