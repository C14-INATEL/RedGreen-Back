import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@modules/auth/domain/dto/create-user.dto';
import { User } from '@modules/auth/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto) {
    const user = this.userRepo.create({
      Email: dto.Email,
      Password: dto.Password, // TODO: hash password!
    });
    return this.userRepo.save(user);
  }

  async signToken(UserId: string) {
    return this.jwtService.signAsync({ UserId });
  }
}
