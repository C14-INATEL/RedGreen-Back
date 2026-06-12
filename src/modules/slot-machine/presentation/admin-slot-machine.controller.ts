import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '@core/guards/admin.guard';
import { SlotMachineService } from '../application/slot-machine.service';

@ApiTags('Admin - SlotMachine')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('admin/slot-machines')
export class AdminSlotMachineController {
  constructor(private readonly SlotMachineService: SlotMachineService) {}

  @Get(':Id/active-sessions')
  @ApiOperation({
    summary: 'List all InProgress sessions for a slot machine (admin)',
  })
  @ApiOkResponse({ description: 'Array of active SlotSessions with User data' })
  async FindActiveSessions(@Param('Id') Id: string) {
    return this.SlotMachineService.FindActiveSessions(+Id);
  }

  @Post(':Id/deactivate')
  @ApiOperation({
    summary:
      'Force-deactivate a slot machine and cash out all active sessions (admin)',
  })
  @ApiOkResponse({
    description: 'Number of sessions closed and chips returned',
    schema: {
      properties: {
        ClosedSessions: { type: 'number' },
        ChipsReturned: { type: 'number' },
      },
    },
  })
  async AdminDeactivate(@Param('Id') Id: string) {
    return this.SlotMachineService.AdminDeactivate(+Id);
  }
}
