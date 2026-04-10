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
import { UpdateUserDto } from '@modules/auth/domain/dto/update-user.dto';
import { User } from '@modules/auth/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepo: Repository<User>,
    private readonly JwtService: JwtService
  ) {}

  async Register(DTO: CreateUserDto) {
    const ExistingUser = await this.UserRepo.findOne({
      where: { Email: DTO.Email },
    });
    if (ExistingUser) {
      throw new BadRequestException('Email already registered');
    }

    const ExistingNickname = await this.UserRepo.findOne({
      where: { Nickname: DTO.Nickname },
    });
    if (ExistingNickname) {
      throw new BadRequestException('Nickname already taken');
    }

    const HashedPassword = await bcrypt.hash(DTO.Password, 10);

    const User = this.UserRepo.create({
      Email: DTO.Email,
      Nickname: DTO.Nickname,
      Name: DTO.Name,
      BirthDate: DTO.BirthDate,
      Password: HashedPassword,
      ChipBalance: DTO.ChipBalance || 0,
      DailyLoginStreak: DTO.DailyLoginStreak || 0,
      Active: true,
    });

    const SavedUser = await this.UserRepo.save(User);

    return this.SanitizeUser(SavedUser);
  }

  async Login(DTO: LoginUserDto) {
    const User = await this.UserRepo.findOne({
      where: { Email: DTO.Email },
    });

    if (!User) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!User.Active) {
      throw new UnauthorizedException('User is not active');
    }

    const PasswordMatch = await bcrypt.compare(DTO.Password, User.Password);
    if (!PasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.SanitizeUser(User);
  }

  async GetProfile(UserId: string) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }
    return this.SanitizeUser(User);
  }

  async GetChipBalance(UserId: string) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }

    return { ChipBalance: User.ChipBalance };
  }

  async UpdateChipBalance(UserId: string, Amount: number) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }

    User.ChipBalance += Amount;
    if (User.ChipBalance < 0) {
      throw new BadRequestException('Insufficient chips');
    }

    await this.UserRepo.save(User);
    return { ChipBalance: User.ChipBalance };
  }

  async IsEmailTaken(Email: string) {
    const ExistingUser = await this.UserRepo.findOne({ where: { Email } });
    return { Email, taken: !!ExistingUser };
  }

  async DeleteAccount(UserId: string) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }

    User.Active = false;
    await this.UserRepo.save(User);

    return { message: 'Account deleted successfully' };
  }

  async UpdateProfile(UserId: string, DTO: UpdateUserDto) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }

    if (DTO.Name) {
      User.Name = DTO.Name;
    }

    if (DTO.BirthDate) {
      User.BirthDate = new Date(DTO.BirthDate);
    }

    if (DTO.Password) {
      User.Password = await bcrypt.hash(DTO.Password, 10);
    }

    const UpdatedUser = await this.UserRepo.save(User);
    return this.SanitizeUser(UpdatedUser);
  }

  async CheckDailyLogin(UserId: string) {
    const User = await this.UserRepo.findOne({ where: { UserId } });
    if (!User) {
      throw new BadRequestException('User not found');
    }

    const Now = new Date();
    const Today = new Date(Now.getFullYear(), Now.getMonth(), Now.getDate());

    if (User.LastLoginDate) {
      const Last = new Date(
        User.LastLoginDate.getFullYear(),
        User.LastLoginDate.getMonth(),
        User.LastLoginDate.getDate()
      );

      if (Last.getTime() === Today.getTime()) {
        return {
          FirstLoginToday: false,
          DailyStreak: User.DailyLoginStreak,
          ChipBalance: User.ChipBalance,
          Reward: 0,
        };
      }

      const Yesterday = new Date(Today);
      Yesterday.setDate(Yesterday.getDate() - 1);

      if (Last.getTime() === Yesterday.getTime()) {
        User.DailyLoginStreak = Math.min(7, User.DailyLoginStreak + 1);
      } else {
        User.DailyLoginStreak = 1;
      }
    } else {
      User.DailyLoginStreak = 1;
    }

    const Streak = Math.min(7, User.DailyLoginStreak);
    const Reward = Streak * 50;
    User.ChipBalance += Reward;
    User.LastLoginDate = Now;

    await this.UserRepo.save(User);

    return {
      FirstLoginToday: true,
      DailyStreak: Streak,
      Reward,
      ChipBalance: User.ChipBalance,
    };
  }

  async SignToken(UserId: string) {
    return this.JwtService.signAsync(
      { UserId },
      { algorithm: 'HS256', expiresIn: '1h' }
    );
  }

  private SanitizeUser(User: User): Omit<User, 'Password'> {
    return Object.fromEntries(
      Object.entries(User).filter(([key]) => key !== 'Password')
    ) as Omit<User, 'Password'>;
  }
}
