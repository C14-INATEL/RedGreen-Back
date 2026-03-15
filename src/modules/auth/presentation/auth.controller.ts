import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from '../domain/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.authService.register(dto);
    const token = await this.authService.signToken(user.id);
    return { user, token };
  }
}
