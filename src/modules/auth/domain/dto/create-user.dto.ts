import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserType } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({
    example: '1990-12-29',
    description: 'Date of birth of the user, is in (YYYY-MM-DD)',
  })
  @IsDateString()
  BirthDate: string;

  @ApiProperty({
    example: 'Johnny',
    description: 'Unique nickname for the user',
  })
  @IsString()
  @IsNotEmpty()
  Nickname: string;

  @ApiProperty({
    example: 'john123@email.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @ApiProperty({
    description: 'User password before hashing',
  })
  @IsNotEmpty()
  @MinLength(8)
  Password: string;

  @ApiProperty({
    example: 10000,
    description: 'User ammount of chips',
  })
  @IsOptional()
  @IsNumber()
  ChipBalance?: number;

  @ApiProperty({
    example: 5,
    description: 'User numerical values of login streak',
  })
  @IsOptional()
  @IsNumber()
  DailyLoginStreak?: number;

  @ApiProperty({
    example: '25/03/2026',
    description: 'User last login date',
  })
  @IsOptional()
  @IsDateString()
  LastLoginDate?: string;

  @ApiProperty({
    example: true,
    description:
      'User account active status. If "active" is true the account is activated, else if "active" is false the account is deactivated',
  })
  @IsOptional()
  @IsBoolean()
  Active?: boolean;

  @ApiProperty({
    example: 'User',
    description:
      'User account type. It can be "User" for regular users or "Admin" for system administrators',
  })
  @IsOptional()
  @IsEnum(UserType)
  UserType?: UserType;
}
