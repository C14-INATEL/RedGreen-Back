import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../auth/domain/user.entity';
import type {
  CurrentSpinResultState,
  RerollState,
} from './types/slot-session.types';

export enum SlotSessionStatus {
  InProgress = 'InProgress',
  Finished = 'Finished',
  CashedOut = 'CashedOut',
}

@Entity({ name: 'SlotSession' })
export class SlotSession {
  @PrimaryGeneratedColumn()
  SlotSessionId!: number;

  @Column('uuid')
  UserId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'UserId' })
  User!: User;

  @Column({ type: 'int' })
  SlotMachineId!: number;

  @Column({ type: 'enum', enum: SlotSessionStatus })
  Status!: SlotSessionStatus;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  StartedAt!: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  LastInteractionAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  EndedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  CurrentRewardSnapshot!: number;

  @Column({ type: 'jsonb' })
  CurrentSpinResult!: CurrentSpinResultState;

  @Column({
    type: 'jsonb',
    default: () => '\'{"Rerolls":{"Max":5,"Used":0}}\'',
  })
  CurrentRerollsSpent!: RerollState;

  @Column({ type: 'timestamp', nullable: true })
  DeletedAt!: Date | null;
}
