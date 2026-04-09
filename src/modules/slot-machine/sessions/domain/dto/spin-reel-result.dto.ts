import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { SlotSymbol } from '../enums/slot-symbol.enum';

export class SpinReelResultDto {
  @ApiProperty({
    example: 0,
    description: 'Index of the reel',
  })
  @IsNumber()
  ReelIndex: number;

  @ApiProperty({
    example: SlotSymbol.Pig,
    description: 'Symbol displayed on the reel',
    enum: SlotSymbol,
  })
  @IsEnum(SlotSymbol)
  SymbolId: SlotSymbol;
}
