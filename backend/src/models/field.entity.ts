import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { Event } from './event.entity';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  sport: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  @Column('simple-array')
  images: string[];

  @Column({ nullable: true }) // Make nullable to allow existing rows
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Booking, booking => booking.field)
  bookings: Booking[];

  @OneToMany(() => Event, event => event.field)
  events: Event[];

  toJSON() {
    // Exclude sensitive or large data if necessary, or explicitly include what's needed
    // For now, return a clean object to prevent potential circular references or unexpected data
    const { bookings, events, ...fieldWithoutRelations } = this;
    return fieldWithoutRelations;
  }
}
