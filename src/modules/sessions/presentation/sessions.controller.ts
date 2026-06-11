import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ActiveSession } from '../domain/active-session.entity';

@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    @InjectRepository(ActiveSession)
    private readonly activeSessionRepo: Repository<ActiveSession>
  ) {}

  @Get('me/active')
  @ApiOperation({ summary: 'Get the active session of the current user' })
  async GetMyActiveSession(
    @CurrentUser() user: { UserId: string }
  ): Promise<ActiveSession | null> {
    return (
      (await this.activeSessionRepo.findOne({
        where: { UserId: user.UserId },
      })) ?? null
    );
  }
}
