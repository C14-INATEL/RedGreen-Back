import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGambitTableDto {
  @ApiProperty({
    example: 'High Stakes Gambit',
    description: 'Name of the gambit table',
  })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({
    example: 'A high-stakes card flipping game with multipliers',
    description: 'Description of the gambit table',
  })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum chips required to access this table',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumChipsRequired?: number;

  @ApiProperty({
    example: 10,
    description: 'Cost in chips per card purchased',
  })
  @IsNumber()
  @Min(1)
  CardPrice: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Base multiplier applied to all point-related rewards on this table',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  TableMultiplier?: number;

  @ApiProperty({
    example: 5,
    description: 'Minimum number of cards that must be purchased',
  })
  @IsNumber()
  @Min(1)
  MinimumCardsPurchased: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Maximum number of cards that can be purchased',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  MaxCardsPurchased?: number;
}
