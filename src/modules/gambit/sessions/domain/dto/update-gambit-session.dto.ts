import { PartialType } from '@nestjs/swagger';
import { CreateGambitSessionDto } from './create-gambit-session.dto';

export class UpdateGambitSessionDto extends PartialType(
  CreateGambitSessionDto
) {}
