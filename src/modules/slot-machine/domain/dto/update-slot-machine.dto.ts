import { PartialType } from '@nestjs/swagger';
import { CreateSlotMachineDto } from './create-slot-machine.dto';

export class UpdateSlotMachineDto extends PartialType(CreateSlotMachineDto) {}
