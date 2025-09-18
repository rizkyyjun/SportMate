import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { EventParticipant } from './event-participant.entity';
import { ChatRoom } from './chat-room.entity';
import { Field } from './field.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  sport: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column({ default: 0 })
  maxParticipants: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.organizedEvents)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => EventParticipant, participant => participant.event)
  participants: EventParticipant[];

  @ManyToOne(() => ChatRoom, chatRoom => chatRoom.events, { nullable: true })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom | null;

  @ManyToOne(() => Field, field => field.events, { nullable: true })
  @JoinColumn({ name: 'field_id' })
  field: Field;
}
