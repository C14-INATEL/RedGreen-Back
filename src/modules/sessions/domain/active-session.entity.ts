import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { GameType } from './enums/game-type.enum';

@Entity({ name: 'ActiveSession' })
@Unique('UQ_ActiveSession_UserId', ['UserId'])
export class ActiveSession {
  @PrimaryGeneratedColumn('uuid')
  ActiveSessionId: string;

  @Column('uuid')
  UserId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'UserId' })
  User: User;

  @Column({ type: 'enum', enum: GameType })
  GameType: GameType;

  @Column({ type: 'int' })
  ReferenceId: number;

  @CreateDateColumn()
  CreatedAt: Date;
}
