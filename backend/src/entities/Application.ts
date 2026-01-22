import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.applications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time']
  })
  availability: string;

  @Column()
  course_code: string;

  @Column({
    type: 'enum',
    enum: ['tutor', 'lab-assistant']
  })
  role: string;

  @Column({ nullable: true })
  experience: number;

  @Column('text', { nullable: true })
  qualifications: string;

  @Column()
  phone_number: string;

  @Column()
  emergency_contact: string;

  @Column()
  emergency_phone: string;

  @Column()
  preferred_hours: string;

  @Column('text')
  previous_institutions: string;

  @Column('text')
  teaching_areas: string;

  @Column('text')
  motivation: string;

  @Column('text')
  references: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}