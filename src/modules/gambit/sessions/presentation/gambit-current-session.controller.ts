import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { GambitSessionService } from '../application/gambit-session.service';
import { ResolveEventDto } from '../domain/dto/resolve-event.dto';
import { ResolveEffectDto } from '../domain/dto/resolve-effect.dto';
import {
  GambitCashOutResultDto,
  GambitResolveEffectResponseDto,
  GambitSessionViewDto,
} from '../domain/dto/gambit-session-view.dto';

@ApiTags('GambitGameplay')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('gambit/sessions')
export class GambitCurrentSessionController {
  constructor(private readonly GambitSessionService: GambitSessionService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the active Gambit session for the user' })
  @ApiOkResponse({ type: GambitSessionViewDto })
  async GetActive(@CurrentUser() CurrentUser: { UserId: string }) {
    return this.GambitSessionService.GetActiveSessionView(CurrentUser.UserId);
  }

  @Post('active/burn/:position')
  @ApiOperation({ summary: 'Burn (flip) a card at the given board position' })
  @ApiOkResponse({ type: GambitSessionViewDto })
  async Burn(
    @Param('position') Position: string,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    return this.GambitSessionService.Burn(CurrentUser.UserId, +Position);
  }

  @Post('active/resolve-event')
  @ApiOperation({
    summary: 'Resolve a pending selection event (pick 1 good + 1 bad)',
  })
  @ApiOkResponse({ type: GambitSessionViewDto })
  async ResolveEvent(
    @Body() DTO: ResolveEventDto,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    return this.GambitSessionService.ResolveEvent(CurrentUser.UserId, DTO);
  }

  @Post('active/resolve-effect')
  @ApiOperation({
    summary: 'Resolve a pending effect interaction (REVEAL/PEEK target picks)',
  })
  @ApiOkResponse({ type: GambitResolveEffectResponseDto })
  async ResolveEffect(
    @Body() DTO: ResolveEffectDto,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    return this.GambitSessionService.ResolveEffect(CurrentUser.UserId, DTO);
  }

  @Post('active/cash-out')
  @ApiOperation({
    summary: 'Collect the prize of a finished session and close it',
  })
  @ApiOkResponse({ type: GambitCashOutResultDto })
  async CashOut(@CurrentUser() CurrentUser: { UserId: string }) {
    return this.GambitSessionService.CashOut(CurrentUser.UserId);
  }
}
