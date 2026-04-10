import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SlotMachine } from '../../domain/slot-machine.entity';
import { User } from '../../../auth/domain/user.entity';
import type {
  CurrentSpinResultState,
  RerollState,
} from './types/slot-session.types';

export enum SlotSessionStatus {
  Active = 'Active',
  Ended = 'Ended',
  Interrupted = 'Interrupted',
  Expired = 'Expired',
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

  @ManyToOne(() => SlotMachine, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'SlotMachineId' })
  SlotMachine!: SlotMachine;

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
    default: () => '\'{"Rerolls":{"Max":0,"Used":0}}\'',
  })
  CurrentRerollsSpent!: RerollState;

  @Column({ type: 'timestamp', nullable: true })
  DeletedAt!: Date | null;
}
