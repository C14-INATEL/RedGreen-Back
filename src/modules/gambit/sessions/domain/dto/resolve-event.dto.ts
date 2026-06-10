import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ResolveEventDto {
  @ApiProperty({
    example: 0,
    minimum: 0,
    maximum: 2,
    description: 'Index (0-2) of the chosen card among the good options',
  })
  @IsInt()
  @Min(0)
  @Max(2)
  GoodIndex: number;

  @ApiProperty({
    example: 1,
    minimum: 0,
    maximum: 2,
    description: 'Index (0-2) of the chosen card among the bad options',
  })
  @IsInt()
  @Min(0)
  @Max(2)
  BadIndex: number;
}
