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
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { AdminGuard } from '@core/guards/admin.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { GambitSessionService } from '../application/gambit-session.service';
import { CreateGambitSessionDto } from '../domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../domain/dto/update-gambit-session.dto';
import { GambitSessionResponseDto } from '../domain/dto/gambit-session-response.dto';
import { GambitTable } from '../../domain/gambit-table.entity';
import { GambitSession } from '../domain/gambit-session.entity';

@ApiExtraModels(GambitTable, GambitSession)
@ApiTags('GambitSession')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('gambit-tables/:GambitTableId/sessions')
export class GambitSessionController {
  constructor(private readonly GambitSessionService: GambitSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gambit session' })
  @ApiCreatedResponse({ type: GambitSessionResponseDto })
  async Create(
    @Param('GambitTableId') GambitTableId: string,
    @CurrentUser() CurrentUser: { UserId: string },
    @Body() DTO: CreateGambitSessionDto
  ) {
    return this.GambitSessionService.Create(
      +GambitTableId,
      DTO,
      CurrentUser.UserId
    );
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all gambit sessions for a gambit table' })
  @ApiOkResponse({ type: GambitSessionResponseDto, isArray: true })
  async FindAll(
    @Param('GambitTableId') GambitTableId: string,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    return this.GambitSessionService.FindAll(
      +GambitTableId,
      CurrentUser.UserId
    );
  }

  @Get(':Id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get a gambit session by ID' })
  @ApiOkResponse({ type: GambitSessionResponseDto })
  async FindOne(
    @Param('GambitTableId') GambitTableId: string,
    @Param('Id') Id: string,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    return this.GambitSessionService.FindOne(
      +GambitTableId,
      +Id,
      CurrentUser.UserId
    );
  }

  @Patch(':Id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update a gambit session by ID' })
  @ApiOkResponse({ type: GambitSessionResponseDto })
  async Update(
    @Param('GambitTableId') GambitTableId: string,
    @Param('Id') Id: string,
    @CurrentUser() CurrentUser: { UserId: string },
    @Body() DTO: UpdateGambitSessionDto
  ) {
    return this.GambitSessionService.Update(
      +GambitTableId,
      +Id,
      DTO,
      CurrentUser.UserId
    );
  }

  @Delete(':Id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a gambit session by ID' })
  async Remove(
    @Param('GambitTableId') GambitTableId: string,
    @Param('Id') Id: string,
    @CurrentUser() CurrentUser: { UserId: string }
  ) {
    await this.GambitSessionService.Remove(
      +GambitTableId,
      +Id,
      CurrentUser.UserId
    );
    return { message: 'Gambit session removed successfully' };
  }
}
