import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { AdminGuard } from '@core/guards/admin.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { SlotSessionService } from '../application/slot-session.service';
import { CreateSlotSessionDto } from '../domain/dto/create-slot-session.dto';
import { UpdateSlotSessionDto } from '../domain/dto/update-slot-session.dto';
import { SlotSession } from '../domain/slot-session.entity';

@ApiTags('SlotSession')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('slot-machines/:slotMachineId/sessions')
export class SlotSessionController {
  constructor(private readonly slotSessionService: SlotSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot session' })
  @ApiCreatedResponse()
  async create(
    @Param('slotMachineId') slotMachineId: string,
    @CurrentUser() currentUser: { UserId: string },
    @Body() dto: CreateSlotSessionDto
  ) {
    return this.slotSessionService.create(
      +slotMachineId,
      dto,
      currentUser.UserId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all slot sessions for a slot machine' })
  @ApiOkResponse({ type: SlotSession, isArray: true })
  async findAll(
    @Param('slotMachineId') slotMachineId: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    return this.slotSessionService.findAll(+slotMachineId, currentUser.UserId);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get a slot session by ID' })
  @ApiOkResponse({ type: SlotSession })
  async findOne(
    @Param('slotMachineId') slotMachineId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    return this.slotSessionService.findOne(
      +slotMachineId,
      +id,
      currentUser.UserId
    );
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update slot session by ID' })
  @ApiOkResponse({ type: SlotSession })
  async update(
    @Param('slotMachineId') slotMachineId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: { UserId: string },
    @Body() dto: UpdateSlotSessionDto
  ) {
    return this.slotSessionService.update(
      +slotMachineId,
      +id,
      dto,
      currentUser.UserId
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Soft delete a slot session by ID' })
  async remove(
    @Param('slotMachineId') slotMachineId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    await this.slotSessionService.remove(
      +slotMachineId,
      +id,
      currentUser.UserId
    );
    return { message: 'Slot session removed successfully' };
  }
  @Post(':id/reroll/:reelIndex')
  @ApiOperation({ summary: 'Reroll a specific reel in the session' })
  @ApiOkResponse()
  async reroll(
    @Param('slotMachineId') slotMachineId: string,
    @Param('id') id: string,
    @Param('reelIndex') reelIndex: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    return this.slotSessionService.reroll(
      +slotMachineId,
      +id,
      +reelIndex,
      currentUser.UserId
    );
  }

  @Post(':id/cash-out')
  @ApiOperation({ summary: 'Cash out the current reward and end the session' })
  async cashOut(
    @Param('slotMachineId') slotMachineId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    return this.slotSessionService.cashOut(
      +slotMachineId,
      +id,
      currentUser.UserId
    );
  }
}
