import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { SlotSessionService } from '../application/slot-session.service';
import { SlotSession } from '../domain/slot-session.entity';

@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class CurrentSessionController {
  constructor(private readonly slotSessionService: SlotSessionService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active session for authenticated user' })
  @ApiOkResponse({ type: SlotSession })
  async getActiveSession(
    @CurrentUser() currentUser: { UserId: string }
  ): Promise<SlotSession | null> {
    return this.slotSessionService.findActiveSession(currentUser.UserId);
  }

  @Post('active/reroll/:reelIndex')
  @ApiOperation({ summary: 'Reroll a specific reel in active session' })
  @ApiOkResponse()
  async rerollActive(
    @Param('reelIndex') reelIndex: string,
    @CurrentUser() currentUser: { UserId: string }
  ) {
    return this.slotSessionService.rerollActive(currentUser.UserId, +reelIndex);
  }

  @Post('active/cash-out')
  @ApiOperation({ summary: 'Cash out active session' })
  async cashOutActive(@CurrentUser() currentUser: { UserId: string }) {
    return this.slotSessionService.cashOutActive(currentUser.UserId);
  }
}
