import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RerollsDto {
  @ApiProperty({ example: 4 })
  @IsNumber()
  Max: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  Used: number;
}

export class RerollStateDto {
  @ApiProperty({ type: RerollsDto })
  @ValidateNested()
  @Type(() => RerollsDto)
  Rerolls: RerollsDto;
}
