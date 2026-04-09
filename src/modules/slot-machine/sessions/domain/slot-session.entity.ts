import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
  SlotSessionId: number;

  @Column({ type: 'int' })
  UserId: number;

  @Column({ type: 'int' })
  SlotMachineId: number;

  @Column({ type: 'enum', enum: SlotSessionStatus })
  Status: SlotSessionStatus;

  @Column({ type: 'timestamp' })
  StartedAt: Date;

  @Column({ type: 'timestamp' })
  LastInteractionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  EndedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  CurrentRewardSnapshot: number;

  @Column({ type: 'jsonb' })
  CurrentSpinResult: CurrentSpinResultState;

  @Column({ type: 'jsonb' })
  CurrentRerollsSpent: RerollState;
}
