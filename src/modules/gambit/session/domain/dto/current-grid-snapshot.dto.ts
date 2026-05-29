import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GambitCard } from '../types/gambit-session.types';

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
}

export class PendingEventDto {
  @ApiProperty({
    example: 'Good',
    enum: ['Good', 'Bad', 'Neutral'],
    description: 'Nature classification of the pending event',
  })
  EventType: 'Good' | 'Bad' | 'Neutral';

  @ApiProperty({
    type: 'array',
    items: { type: 'string', enum: Object.values(GambitCard) },
    description: 'Three effect cards offered to the player',
  })
  CardsOffered: [GambitCard, GambitCard, GambitCard];
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
}
