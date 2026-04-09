import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SpinReelResultDto } from './spin-reel-result.dto';

export class CurrentSpinResultStateDto {
  @ApiProperty({
    type: [SpinReelResultDto],
    description: 'Array of reel results',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpinReelResultDto)
  Reels: SpinReelResultDto[];
}
