import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../models/user.entity';
import { Field } from '../models/field.entity';
import { Booking } from '../models/booking.entity';
import { TeammateRequest } from '../models/teammate-request.entity';
import { TeammateParticipant } from '../models/teammate-participant.entity';
import { Event } from '../models/event.entity';
import { EventParticipant } from '../models/event-participant.entity';
import { Message } from '../models/message.entity';
import { ChatRoom } from '../models/chat-room.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sportmate',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Field,
    Booking,
    TeammateRequest,
    TeammateParticipant,
    Event,
    EventParticipant,
    Message,
    ChatRoom
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
