import { Body, Controller, HttpCode, Post } from '@nestjs/common';
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
  async register(@Body() dto: CreateUserDto) {
    const User = await this.AuthService.Register(dto);
    const Token = await this.AuthService.SignToken(User.UserId);
    return { User, Token };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login an existing User' })
  async login(@Body() dto: LoginUserDto) {
    const User = await this.AuthService.Login(dto);
    const Token = await this.AuthService.SignToken(User.UserId);
    return { User, Token };
  }
}
