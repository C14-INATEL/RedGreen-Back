import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../domain/dto/create-user.dto';
import { User } from '../domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto) {
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: dto.password, // TODO: hash password!
    });
    return this.userRepo.save(user);
  }

  async signToken(userId: string) {
    return this.jwtService.signAsync({ userId });
  }
}
