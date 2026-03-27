import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../application/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly AuthService: AuthService,
    private readonly ConfigService: ConfigService
  ) {
    const secret = ConfigService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(Payload: { UserId: string }) {
    if (!Payload || !Payload.UserId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const User = await this.AuthService.GetProfile(Payload.UserId);
    if (!User) {
      throw new UnauthorizedException('User not found');
    }

    return { UserId: Payload.UserId };
  }
}
