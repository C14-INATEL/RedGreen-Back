import { PartialType } from '@nestjs/swagger';
import { CreateGambitTableDto } from './create-gambit-table.dto';

export class UpdateGambitTableDto extends PartialType(CreateGambitTableDto) {}
