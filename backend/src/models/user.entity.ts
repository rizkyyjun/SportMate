import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { TeammateRequest } from './teammate-request.entity';
import { TeammateParticipant } from './teammate-participant.entity';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';
import { Message } from './message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Booking, booking => booking.user)
  bookings: Booking[];

  @OneToMany(() => TeammateRequest, teammateRequest => teammateRequest.creator)
  teammateRequests: TeammateRequest[];

  @OneToMany(() => TeammateParticipant, teammateParticipant => teammateParticipant.user)
  teammateParticipations: TeammateParticipant[];

  @OneToMany(() => Event, event => event.organizer)
  organizedEvents: Event[];

  @OneToMany(() => EventParticipant, eventParticipant => eventParticipant.user)
  eventParticipations: EventParticipant[];

  @OneToMany(() => Message, message => message.sender)
  messages: Message[];
}
