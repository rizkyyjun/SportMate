import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TeammateParticipant } from './teammate-participant.entity';
import { ChatRoom } from './chat-room.entity';

@Entity('teammate_requests')
export class TeammateRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.teammateRequests)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  sport: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  requiredParticipants: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TeammateParticipant, participant => participant.teammateRequest)
  participants: TeammateParticipant[];

  @ManyToOne(() => ChatRoom, chatRoom => chatRoom.teammateRequests, { nullable: true })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}
