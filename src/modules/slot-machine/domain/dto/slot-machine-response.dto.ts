import { ApiProperty } from '@nestjs/swagger';

export class SlotMachineResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the slot machine',
  })
  SlotMachineId: number;

  @ApiProperty({
    example: 'Lucky Slots',
    description: 'Name of the slot machine',
  })
  Name: string;

  @ApiProperty({
    example: 'A fun slot machine with high jackpots',
    description:
      'Description of the theme or special features of the slot machine',
    nullable: true,
  })
  Description: string | null;

  @ApiProperty({
    example: 10,
    description: 'Minimum value per spin allowed on this machine',
    nullable: true,
  })
  MinimumSpinValue: number | null;

  @ApiProperty({
    example: 100,
    description:
      'Minimum chips required for the user to have access to this machine',
    nullable: true,
  })
  MinimumChipsRequired: number | null;

  @ApiProperty({
    example: 20,
    description: 'Minimum chips required to perform a reroll on this machine',
    nullable: true,
  })
  MinimumRerollValue: number | null;

  @ApiProperty({
    example: 5,
    description: 'Maximum rerolls allowed on this machine',
  })
  MaxRerolls: number;

  @ApiProperty({
    example: true,
    description: 'Whether the slot machine is active or inactive',
  })
  Active: boolean;
}
