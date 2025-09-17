import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TeammateRequest } from './teammate-request.entity';

export enum ParticipantStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('teammate_participants')
export class TeammateParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.teammateParticipations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TeammateRequest, teammateRequest => teammateRequest.participants)
  @JoinColumn({ name: 'teammate_request_id' })
  teammateRequest: TeammateRequest;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.PENDING
  })
  status: ParticipantStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
