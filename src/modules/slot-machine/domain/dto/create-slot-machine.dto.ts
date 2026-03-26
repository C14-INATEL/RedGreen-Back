import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateSlotMachineDto {
  @ApiProperty({
    example: 'Lucky Slots',
    description: 'Name of the slot machine',
  })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({
    example: 'A fun slot machine game',
    description: 'Description of the slot machine',
    required: false,
  })
  @IsOptional()
  @IsString()
  Description: string;

  @ApiProperty({
    example: 10,
    description: 'Minimum spin value',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumSpinValue: number;

  @ApiProperty({
    example: 100,
    description: 'Minimum chips required',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumChipsRequired: number;

  @ApiProperty({
    example: 0,
    description: 'Maximum number of rerolls',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MaxRerolls: number;

  @ApiProperty({
    example: true,
    description: 'Whether the slot machine is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  Active: boolean;
}
