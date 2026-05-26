import { ApiProperty } from '@nestjs/swagger';

export class GambitTableResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the gambit table',
  })
  GambitTableId: number;

  @ApiProperty({
    example: 'High Stakes Gambit',
    description: 'Name of the gambit table',
  })
  Name: string;

  @ApiProperty({
    example: 'A high-stakes card flipping game with multipliers',
    description: 'Description of the gambit table',
    nullable: true,
  })
  Description: string | null;

  @ApiProperty({
    example: 100,
    description: 'Minimum chips required to access this table',
    nullable: true,
  })
  MinimumChipsRequired: number | null;

  @ApiProperty({
    example: 10,
    description: 'Cost in chips per card purchased',
  })
  CardPrice: number;

  @ApiProperty({
    example: 1,
    description: 'Base multiplier applied to all rewards on this table',
  })
  TableMultiplier: number;

  @ApiProperty({
    example: 2,
    description:
      'Scale factor applied to multipliers when purchasing more cards',
  })
  PurchaseMultiplierScale: number;

  @ApiProperty({
    example: 5,
    description: 'Minimum number of cards that must be purchased',
  })
  MinimumCardsPurchased: number;

  @ApiProperty({
    example: 20,
    description: 'Maximum number of cards that can be purchased',
  })
  MaxCardsPurchased: number;

  @ApiProperty({
    example: 5,
    description: 'Number of card flips between event triggers',
  })
  EventInterval: number;

  @ApiProperty({
    example: true,
    description: 'Whether the gambit table is active or inactive',
  })
  Active: boolean;
}
