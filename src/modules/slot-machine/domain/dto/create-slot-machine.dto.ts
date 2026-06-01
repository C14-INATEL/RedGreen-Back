import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
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
    example: 'A machine with high prizes',
    description:
      'Description of the theme or special features of the slot machine',
    required: false,
  })
  @IsOptional()
  @IsString()
  Description: string;

  @ApiProperty({
    example: 20,
    description: 'Minimum value per spin',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumSpinValue: number;

  @ApiProperty({
    example: 100,
    description:
      'Minimum chips required for the user to have acess to this machine',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumChipsRequired: number;

  @ApiProperty({
    example: 10,
    description: 'Minimum chips required to perform a reroll on this machine',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinimumRerollValue: number;
}
