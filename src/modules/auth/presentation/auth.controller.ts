import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from '@modules/auth/domain/dto/create-user.dto';
import { LoginUserDto } from '@modules/auth/domain/dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new User' })
  async Register(@Body() DTO: CreateUserDto) {
    const User = await this.AuthService.Register(DTO);
    const Token = await this.AuthService.SignToken(User.UserId);
    return { User, Token };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login an existing User' })
  async Login(@Body() DTO: LoginUserDto) {
    const User = await this.AuthService.Login(DTO);
    const Token = await this.AuthService.SignToken(User.UserId);
    return { User, Token };
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if email is already registered' })
  async EmailExists(@Query('email') Email: string) {
    return this.AuthService.IsEmailTaken(Email);
  }
}
