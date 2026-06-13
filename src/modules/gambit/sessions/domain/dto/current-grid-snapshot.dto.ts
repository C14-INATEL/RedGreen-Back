import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GambitCard } from '../types/gambit-session.types';

export class PendingInteractionDto {
  @ApiProperty({
    enum: GambitCard,
    enumName: 'GambitCard',
    description: 'The effect card that triggered this interaction',
  })
  Effect: GambitCard;

  @ApiProperty({
    example: 'SELECT_CARD',
    enum: ['SELECT_CARD', 'SELECT_MULTIPLE_CARDS'],
    description: 'The type of selection action required from the player',
  })
  Action: 'SELECT_CARD' | 'SELECT_MULTIPLE_CARDS';

  @ApiProperty({
    example: 1,
    description: 'Number of card positions the player must select',
  })
  RequiredSelections: number;

  @ApiProperty({
    example: [],
    type: [Number],
    description: 'Grid positions already selected by the player',
  })
  SelectedPositions: number[];
}

export class GridCardDto {
  @ApiProperty({
    example: 0,
    description:
      'Sequential index of the cell in a 5x5 grid (0 = top-left, 24 = bottom-right):\n\n' +
      ' 0  1  2  3  4\n\n' +
      ' 5  6  7  8  9\n\n' +
      '10 11 12 13 14\n\n' +
      '15 16 17 18 19\n\n' +
      '20 21 22 23 24',
  })
  Position: number;

  @ApiProperty({
    example: 100,
    description: 'Point value of this card',
  })
  Points: number;

  @ApiPropertyOptional({
    enum: GambitCard,
    enumName: 'GambitCard',
    nullable: true,
    description: 'Effect card placed on this position, or null if none',
  })
  Effect: GambitCard | null;

  @ApiProperty({
    example: false,
    description:
      'When true the card is locked (LOCK_GOOD_CARD) and cannot be burned',
  })
  Locked: boolean;
}

export class PendingEventDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', enum: Object.values(GambitCard) },
    description: 'Three good (or neutral) effect cards offered to the player',
  })
  GoodOptions: GambitCard[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', enum: Object.values(GambitCard) },
    description: 'Three bad (or neutral) effect cards offered to the player',
  })
  BadOptions: GambitCard[];
}

export class CurrentGridSnapshotDto {
  @ApiProperty({
    type: () => [GridCardDto],
    description:
      'Cards not yet revealed. This array is stripped before any response reaches the client.',
  })
  Unrevealed: GridCardDto[];

  @ApiProperty({
    type: () => [GridCardDto],
    description: 'Cards that have already been revealed',
  })
  Revealed: GridCardDto[];

  @ApiProperty({
    type: () => PendingEventDto,
    nullable: true,
    description: 'Active pending event, or null if no event is in progress',
  })
  PendingEvent: PendingEventDto | null;

  @ApiProperty({
    type: () => PendingInteractionDto,
    nullable: true,
    description:
      'Active pending interaction requiring player input, or null if none',
  })
  PendingInteraction: PendingInteractionDto | null;

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    description:
      'Server-only: ManualFlipsCount values whose selection event already fired',
  })
  EventsFired: number[];
}
