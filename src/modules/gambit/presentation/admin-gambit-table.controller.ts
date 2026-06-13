import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '@core/guards/admin.guard';
import { GambitTableService } from '../application/gambit-table.service';

@ApiTags('Admin - GambitTable')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('admin/gambit-tables')
export class AdminGambitTableController {
  constructor(private readonly GambitTableService: GambitTableService) {}

  @Get(':Id/active-sessions')
  @ApiOperation({
    summary: 'List all InProgress sessions for a gambit table (admin)',
  })
  @ApiOkResponse({
    description: 'Array of active GambitSessions with User data',
  })
  async FindActiveSessions(@Param('Id') Id: string) {
    return this.GambitTableService.FindActiveSessions(+Id);
  }

  @Post(':Id/deactivate')
  @ApiOperation({
    summary:
      'Force-deactivate a gambit table and cash out all active sessions (admin)',
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
    return this.GambitTableService.AdminDeactivate(+Id);
  }
}
