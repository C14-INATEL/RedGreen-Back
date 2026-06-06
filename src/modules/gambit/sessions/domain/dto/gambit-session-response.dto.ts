import { ApiProperty } from '@nestjs/swagger';
import { GambitSessionStatus } from '../gambit-session.entity';
import { GambitTableResponseDto } from '../../../domain/dto/gambit-table-response.dto';
import { CurrentGridSnapshotDto } from './current-grid-snapshot.dto';
import type { CurrentGridSnapshot } from '../types/gambit-session.types';
import { GambitCard } from '../types/gambit-session.types';

export class GambitSessionResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the gambit session',
  })
  GambitSessionId: number;

  @ApiProperty({
    example: 'c14e1f5a-09b2-4f4e-97b2-19b1b2c0a0d1',
    description: 'UUID of the user who owns this session',
  })
  UserId: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the gambit table used in this session',
  })
  GambitTableId: number;

  @ApiProperty({
    type: () => GambitTableResponseDto,
    description: 'The gambit table associated with this session',
  })
  GambitTable: GambitTableResponseDto;

  @ApiProperty({
    example: 10,
    description: 'Number of cards purchased for this session',
  })
  CardsPurchased: number;

  @ApiProperty({
    example: 0,
    description:
      'Number of manual card flips performed by the player. Used to determine when the next PendingEvent triggers.',
  })
  ManualFlipsCount: number;

  @ApiProperty({
    example: 10,
    description:
      'Number of burn slots available for the player. Starts equal to CardsPurchased and can be modified by card effects during the session.',
  })
  BurnSlotsAvailable: number;

  @ApiProperty({
    example: 150,
    description:
      'Raw points accumulated during the session. Can be negative, zero, or positive. The final reward in chips is calculated at session end by applying the table multipliers to this value.',
  })
  AccumulatedPoints: number;

  @ApiProperty({
    type: () => CurrentGridSnapshotDto,
    nullable: true,
    description:
      'Current state of the game grid. The Unrevealed array is always stripped before any response reaches the client.',
  })
  CurrentGridSnapshot: CurrentGridSnapshot | null;

  @ApiProperty({
    enum: GambitCard,
    enumName: 'GambitCard',
    nullable: true,
    description: 'Effect card to be applied on the next scoring card revealed',
  })
  NextEffect: GambitCard | null;

  @ApiProperty({
    enum: GambitSessionStatus,
    description: 'Status of the session',
  })
  Status: GambitSessionStatus;

  @ApiProperty({
    example: null,
    description: 'Final result of the session in chips',
    nullable: true,
  })
  Result: number | null;

  @ApiProperty({
    description: 'Session creation timestamp',
  })
  CreatedAt: Date;

  @ApiProperty({
    description: 'Session last update timestamp',
  })
  UpdatedAt: Date;
}
