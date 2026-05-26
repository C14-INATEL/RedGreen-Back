import { ApiProperty } from '@nestjs/swagger';
import { GambitSessionStatus } from '../gambit-session.entity';
import { GambitTableResponseDto } from '../../../table/domain/dto/gambit-table-response.dto';
import { CurrentGridSnapshotDto } from './current-grid-snapshot.dto';
import type { CurrentGridSnapshot } from '../types/gambit-session.types';

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
    example: 2,
    description: 'Number of cards revealed so far',
  })
  CardsRevealed: number;

  @ApiProperty({
    example: 0,
    description: 'Number of manual card flips performed',
  })
  ManualFlipsCount: number;

  @ApiProperty({
    example: 100,
    description: 'Current accumulated reward snapshot',
  })
  CurrentRewardSnapshot: number;

  @ApiProperty({
    type: () => CurrentGridSnapshotDto,
    nullable: true,
    description:
      'Current state of the game grid. The Unrevealed array is always stripped before any response reaches the client.',
  })
  CurrentGridSnapshot: CurrentGridSnapshot | null;

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
