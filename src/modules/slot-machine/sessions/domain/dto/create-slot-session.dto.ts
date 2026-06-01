import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSlotSessionDto {
  @ApiPropertyOptional({
    example: '2023-10-01T12:00:00-03:00',
    description: 'Start time of the session',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  StartedAt: Date;

  @ApiPropertyOptional({
    example: '2023-10-01T12:05:00-03:00',
    description: 'Last interaction time',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  LastInteractionAt: Date;

  @ApiPropertyOptional({
    example: '2023-10-01T12:10:00-03:00',
    description: 'End time of the session',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  EndedAt: Date | null;
}
