import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { TeammateRequest } from './teammate-request.entity';
import { Event } from './event.entity';

export enum ChatRoomType {
  DIRECT = 'direct',
  TEAMMATE = 'teammate',
  EVENT = 'event'
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    default: 'direct'
  })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToMany(() => User)
  @JoinTable({
    name: 'chat_room_participants',
    joinColumn: { name: 'chat_room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  participants: User[];

  @OneToMany(() => Message, message => message.room)
  messages: Message[];

  @OneToMany(() => TeammateRequest, teammateRequest => teammateRequest.chatRoom)
  teammateRequests: TeammateRequest[];

  @OneToMany(() => Event, event => event.chatRoom)
  events: Event[];
}
