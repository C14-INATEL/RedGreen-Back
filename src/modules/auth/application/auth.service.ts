import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '@modules/auth/domain/dto/create-user.dto';
import { LoginUserDto } from '@modules/auth/domain/dto/login-user.dto';
import { User } from '@modules/auth/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepo: Repository<User>,
    private readonly JwtService: JwtService
  ) {}

  async Register(dto: CreateUserDto) {
    const ExistingUser = await this.UserRepo.findOne({
      where: { Email: dto.Email },
    });
    if (ExistingUser) {
      throw new BadRequestException('Email already registered');
    }

    const ExistingNickname = await this.UserRepo.findOne({
      where: { Nickname: dto.Nickname },
    });
    if (ExistingNickname) {
      throw new BadRequestException('Nickname already taken');
    }

    const HashedPassword = await bcrypt.hash(dto.Password, 10);

    const User = this.UserRepo.create({
      Email: dto.Email,
      Nickname: dto.Nickname,
      Name: dto.Name,
      BirthDate: dto.BirthDate,
      Password: HashedPassword,
      ChipBalance: dto.ChipBalance || 0,
      DailyLoginStreak: dto.DailyLoginStreak || 0,
      Active: true,
    });

    const SavedUser = await this.UserRepo.save(User);

    return this.SanitizeUser(SavedUser);
  }

  async Login(dto: LoginUserDto) {
    const User = await this.UserRepo.findOne({
      where: { Email: dto.Email },
    });

    if (!User) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!User.Active) {
      throw new UnauthorizedException('User is not active');
    }

    const PasswordMatch = await bcrypt.compare(dto.Password, User.Password);
    if (!PasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.UserRepo.update(
      { UserId: User.UserId },
      { LastLoginDate: new Date() }
    );

    return this.SanitizeUser(User);
  }

  async SignToken(UserId: string) {
    return this.JwtService.signAsync({ UserId }, { algorithm: 'HS256' });
  }

  private SanitizeUser(User: User): Omit<User, 'Password'> {
    return Object.fromEntries(
      Object.entries(User).filter(([key]) => key !== 'Password')
    ) as Omit<User, 'Password'>;
  }
}
