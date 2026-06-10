import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GambitCard } from '../types/gambit-session.types';
import { GambitSessionStatus } from '../gambit-session.entity';
import {
  GridCardDto,
  PendingEventDto,
  PendingInteractionDto,
} from './current-grid-snapshot.dto';

export class GambitUnrevealedViewDto {
  @ApiProperty({ example: 0, description: 'Board position (0-24)' })
  Position: number;

  @ApiProperty({ example: false, description: 'Whether the card is locked' })
  Locked: boolean;
}

export class GambitGridViewDto {
  @ApiProperty({
    type: () => [GridCardDto],
    description: 'Cards already revealed (full data)',
  })
  Revealed: GridCardDto[];

  @ApiProperty({
    type: () => [GambitUnrevealedViewDto],
    description:
      'Not-yet-revealed cards — only position and lock state; points/effects are hidden (anti-cheat)',
  })
  Unrevealed: GambitUnrevealedViewDto[];

  @ApiProperty({ type: () => PendingEventDto, nullable: true })
  PendingEvent: PendingEventDto | null;

  @ApiProperty({ type: () => PendingInteractionDto, nullable: true })
  PendingInteraction: PendingInteractionDto | null;
}

export class GambitSessionViewDto {
  @ApiProperty({ example: 1 })
  GambitSessionId: number;

  @ApiProperty({ example: 1 })
  GambitTableId: number;

  @ApiProperty({ example: 'c14e1f5a-09b2-4f4e-97b2-19b1b2c0a0d1' })
  UserId: string;

  @ApiProperty({ example: 10 })
  CardsPurchased: number;

  @ApiProperty({
    example: 10,
    description: 'Cards the player may still burn (incl. effect modifiers)',
  })
  BurnSlotsAvailable: number;

  @ApiProperty({ example: 3 })
  ManualFlipsCount: number;

  @ApiProperty({
    example: 7,
    description: 'BurnSlotsAvailable - ManualFlipsCount',
  })
  BurnsRemaining: number;

  @ApiProperty({
    example: 120,
    description: 'In-game points so far (can be negative)',
  })
  AccumulatedPoints: number;

  @ApiPropertyOptional({
    enum: GambitCard,
    enumName: 'GambitCard',
    nullable: true,
    description: 'Pending effect applied to the next burned card',
  })
  NextEffect: GambitCard | null;

  @ApiProperty({ enum: GambitSessionStatus, enumName: 'GambitSessionStatus' })
  Status: GambitSessionStatus;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Final reward in chips (set once the session is Finished)',
  })
  Result: number | null;

  @ApiProperty({ type: () => GambitGridViewDto })
  Grid: GambitGridViewDto;
}

export class PeekResultDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'REVEAL: peeked card position',
  })
  Position?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'REVEAL: peeked card points',
  })
  Points?: number;

  @ApiPropertyOptional({
    enum: GambitCard,
    enumName: 'GambitCard',
    nullable: true,
    description:
      'REVEAL: peeked card effect (a BUMIS_INFILTRADOS shows a fake good card)',
  })
  Effect?: GambitCard | null;

  @ApiPropertyOptional({
    example: true,
    description:
      'PEEK_CARDS: whether at least one of the 3 chosen cards is bad',
  })
  AtLeastOneBad?: boolean;
}

export class GambitResolveEffectResponseDto extends GambitSessionViewDto {
  @ApiProperty({
    type: () => PeekResultDto,
    nullable: true,
    description: 'Ephemeral peek result (REVEAL/PEEK), or null',
  })
  PeekResult: PeekResultDto | null;
}

export class GambitCashOutResultDto {
  @ApiProperty({ example: 'Cash out successful' })
  message: string;

  @ApiProperty({ example: 120, description: 'Chips paid out: max(0, Result)' })
  reward: number;

  @ApiProperty({ example: 1120, description: 'Chip balance after cash-out' })
  finalBalance: number;
}
