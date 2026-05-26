import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'GambitTable' })
export class GambitTable {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the gambit table',
  })
  @PrimaryGeneratedColumn()
  GambitTableId: number;

  @ApiProperty({
    example: 'High Stakes Gambit',
    description: 'Name of the gambit table',
  })
  @Column()
  Name: string;

  @ApiPropertyOptional({
    example: 'A high-stakes card flipping game with multipliers',
    description: 'Description of the gambit table',
    nullable: true,
  })
  @Column({ nullable: true })
  Description: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum chips required to access this table',
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  MinimumChipsRequired: number;

  @ApiProperty({ example: 10, description: 'Cost in chips per card purchased' })
  @Column({ type: 'int' })
  CardPrice: number;

  @ApiProperty({
    example: 1,
    description: 'Base multiplier applied to all rewards on this table',
  })
  @Column({ type: 'int', default: 1 })
  TableMultiplier: number;

  @ApiProperty({
    example: 2,
    description:
      'Scale factor applied to multipliers when purchasing more cards',
  })
  @Column({ type: 'int' })
  PurchaseMultiplierScale: number;

  @ApiProperty({
    example: 5,
    description: 'Minimum number of cards that must be purchased',
  })
  @Column({ type: 'int' })
  MinimumCardsPurchased: number;

  @ApiProperty({
    example: 20,
    description: 'Maximum number of cards that can be purchased',
  })
  @Column({ type: 'int', default: 20 })
  MaxCardsPurchased: number;

  @ApiProperty({
    example: 5,
    description: 'Number of card flips between event triggers',
  })
  @Column({ type: 'int' })
  EventInterval: number;

  @ApiProperty({
    example: true,
    description: 'Whether the gambit table is active or inactive',
  })
  @Column({ default: true })
  Active: boolean;
}
