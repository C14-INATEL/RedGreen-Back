import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SlotMachineService } from '../application/slot-machine.service';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';

@ApiTags('SlotMachine')
@Controller('slot-machine')
export class SlotMachineController {
  constructor(private readonly SlotMachineService: SlotMachineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot machine' })
  async create(@Body() dto: CreateSlotMachineDto) {
    return this.SlotMachineService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all slot machines' })
  async findAll() {
    return this.SlotMachineService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a slot machine by ID' })
  async findOne(@Param('id') id: string) {
    return this.SlotMachineService.findOne(+id);
  }
}
