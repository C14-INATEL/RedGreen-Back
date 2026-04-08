import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { SlotSessionStatus } from '../slot-session.entity';
import type {
  CurrentSpinResultState,
  RerollState,
} from '../types/slot-session.types';

export class CreateSlotSessionDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the user starting the session',
  })
  @IsNumber()
  UserId: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the slot machine',
  })
  @IsNumber()
  SlotMachineId: number;

  @ApiPropertyOptional({
    example: SlotSessionStatus.Active,
    description: 'Status of the session',
    enum: SlotSessionStatus,
  })
  @IsOptional()
  @IsEnum(SlotSessionStatus)
  Status: SlotSessionStatus;

  @ApiPropertyOptional({
    example: '2023-10-01T12:00:00-03:00',
    description: 'Start time of the session',
  })
  @IsOptional()
  @IsDateString()
  StartedAt: string;

  @ApiPropertyOptional({
    example: '2023-10-01T12:05:00-03:00',
    description: 'Last interaction time',
  })
  @IsOptional()
  @IsDateString()
  LastInteractionAt: string;

  @ApiPropertyOptional({
    example: '2023-10-01T12:10:00-03:00',
    description: 'End time of the session',
  })
  @IsOptional()
  @IsDateString()
  EndedAt: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Current reward in the slot machine',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  CurrentRewardSnapshot: number;

  @ApiProperty({
    example: {
      Reels: [
        { ReelIndex: 0, SymbolId: 'Pig' },
        { ReelIndex: 1, SymbolId: 'Rat' },
        { ReelIndex: 2, SymbolId: 'Orange' },
        { ReelIndex: 3, SymbolId: 'Cheese' },
      ],
    },
    description:
      'Current spin result including the current symbols shown in each reel',
    type: 'object',
    properties: {
      reels: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ReelIndex: {
              type: 'number',
              example: 0,
            },
            SymbolId: {
              type: 'string',
              example: 'Pig',
            },
          },
        },
      },
    },
  })
  @IsObject()
  CurrentSpinResult: CurrentSpinResultState;

  @ApiPropertyOptional({
    example: {
      Rerolls: {
        Max: 4,
        Used: 1,
      },
    },
    description: 'Current reroll usage state of the session',
    type: 'object',
    properties: {
      Rerolls: {
        type: 'object',
        properties: {
          Max: {
            type: 'number',
            example: 4,
          },
          Used: {
            type: 'number',
            example: 1,
          },
        },
      },
    },
  })
  @IsOptional()
  @IsObject()
  CurrentRerollsSpent: RerollState;
}
