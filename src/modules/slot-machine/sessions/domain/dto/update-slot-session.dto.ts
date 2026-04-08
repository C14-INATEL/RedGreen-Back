import { PartialType } from '@nestjs/swagger';
import { CreateSlotSessionDto } from './create-slot-session.dto';

export class UpdateSlotSessionDto extends PartialType(CreateSlotSessionDto) {}
