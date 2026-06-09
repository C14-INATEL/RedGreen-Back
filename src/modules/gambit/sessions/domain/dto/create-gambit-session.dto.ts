import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateGambitSessionDto {
  @ApiProperty({
    example: 10,
    description: 'Number of cards purchased for this session',
  })
  @IsInt()
  @Min(1)
  CardsPurchased: number;
}
