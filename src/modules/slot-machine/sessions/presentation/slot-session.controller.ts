import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SlotSessionService } from '../application/slot-session.service';
import { CreateSlotSessionDto } from '../domain/dto/create-slot-session.dto';
import { UpdateSlotSessionDto } from '../domain/dto/update-slot-session.dto';
import { SlotSession } from '../domain/slot-session.entity';

@ApiTags('SlotSession')
@Controller('slot-session')
export class SlotSessionController {
  constructor(private readonly SlotSessionService: SlotSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot session' })
  @ApiCreatedResponse({ type: SlotSession })
  async create(@Body() dto: CreateSlotSessionDto) {
    return this.SlotSessionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all slot sessions' })
  @ApiOkResponse({ type: SlotSession, isArray: true })
  async findAll() {
    return this.SlotSessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a slot session by ID' })
  @ApiOkResponse({ type: SlotSession })
  async findOne(@Param('id') id: string) {
    return this.SlotSessionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update slot session by ID' })
  @ApiOkResponse({ type: SlotSession })
  async update(@Param('id') id: string, @Body() dto: UpdateSlotSessionDto) {
    return this.SlotSessionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slot session by ID' })
  async remove(@Param('id') id: string) {
    await this.SlotSessionService.remove(+id);
    return { message: 'Slot session removed successfully' };
  }
}
