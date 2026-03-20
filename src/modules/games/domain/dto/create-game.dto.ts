import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Slots',
    description: 'The name of the game',
  })
  Name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'A slot machine game with exciting rewards',
    description: 'Detailed description of the game',
  })
  Description: string;

  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'The base reward value for the game',
  })
  BaseRewardValue: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'Whether the game is active or not',
  })
  Active?: boolean;
}
