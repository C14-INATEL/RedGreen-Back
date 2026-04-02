import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SlotMachineService } from '../application/slot-machine.service';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';
import { UpdateSlotMachineDto } from '../domain/dto/update-slot-machine.dto';
import { SlotMachineResponseDto } from '../domain/dto/slot-machine-response.dto';

@ApiTags('SlotMachine')
@Controller('slot-machine')
export class SlotMachineController {
  constructor(private readonly SlotMachineService: SlotMachineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot machine' })
  @ApiCreatedResponse({ type: SlotMachineResponseDto })
  async create(@Body() dto: CreateSlotMachineDto) {
    return this.SlotMachineService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all slot machines' })
  @ApiOkResponse({ type: SlotMachineResponseDto, isArray: true })
  async findAll() {
    return this.SlotMachineService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async findOne(@Param('id') id: string) {
    return this.SlotMachineService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateSlotMachineDto) {
    return this.SlotMachineService.update(+id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async deactivate(@Param('id') id: string) {
    return this.SlotMachineService.deactivate(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slot machine by ID' })
  async remove(@Param('id') id: string) {
    await this.SlotMachineService.remove(+id);
    return { message: 'Slot machine removed successfully' };
  }
}
