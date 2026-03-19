import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserType {
  ADMIN = 'Admin',
  USER = 'User',
}

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  UserId: string;

  @Column()
  Name: string;

  @Column()
  BirthDate: Date;

  @Column({ unique: true })
  Nickname: string;

  @Column({ unique: true })
  Email: string;

  @Column()
  Password: string;

  @Column({ default: 0 })
  ChipBalance: number;

  @Column({ default: 0 })
  DailyLoginStreak: number;

  @Column({ nullable: true })
  LastLoginDate: Date;

  @CreateDateColumn()
  CreatedAt: Date;

  @Column({ default: true })
  Active: boolean;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  UserType: UserType;
}
