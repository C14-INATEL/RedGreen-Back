import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { UpdateUserDto } from '../domain/dto/update-user.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly AuthService: AuthService) {}

  @Get('profile')
  @ApiOperation({ summary: "Get User's profile" })
  async GetProfile(
    @CurrentUser() CurrentUser: { UserId: string; UserType: string }
  ) {
    return this.AuthService.GetProfile(CurrentUser.UserId);
  }

  @Get('chips')
  @ApiOperation({ summary: 'Get current User Chip Balance' })
  async GetChipBalance(
    @CurrentUser() CurrentUser: { UserId: string; UserType: string }
  ) {
    return this.AuthService.GetChipBalance(CurrentUser.UserId);
  }

  @Post('daily-login')
  @ApiOperation({ summary: 'Process daily first-login logic and reward Chips' })
  async DailyLogin(
    @CurrentUser() CurrentUser: { UserId: string; UserType: string }
  ) {
    return this.AuthService.CheckDailyLogin(CurrentUser.UserId);
  }

  @Delete('')
  @ApiOperation({
    summary: 'Delete current User account (set Active to false)',
  })
  async DeleteAccount(
    @CurrentUser() CurrentUser: { UserId: string; UserType: string }
  ) {
    return this.AuthService.DeleteAccount(CurrentUser.UserId);
  }

  @Patch('')
  @ApiOperation({
    summary: 'Update User profile fields: Name, BirthDate, Password',
  })
  async UpdateProfile(
    @CurrentUser() CurrentUser: { UserId: string },
    @Body() DTO: UpdateUserDto
  ) {
    return this.AuthService.UpdateProfile(CurrentUser.UserId, DTO);
  }
}
