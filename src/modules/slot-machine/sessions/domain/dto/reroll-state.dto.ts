import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class RerollStateDto {
  @ApiProperty({
    type: 'object',
    properties: {
      Max: { type: 'number', example: 4 },
      Used: { type: 'number', example: 1 },
    },
  })
  @IsObject()
  Rerolls: {
    Max: number;
    Used: number;
  };
}
