import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class ResolveEffectDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    example: [4, 9, 17],
    description:
      'Board positions chosen as targets for the pending interaction effect',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsInt({ each: true })
  @Min(0, { each: true })
  Positions: number[];
}
