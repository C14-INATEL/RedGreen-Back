import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'john123@email.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @ApiProperty({
    description: 'User password',
  })
  @IsNotEmpty()
  @MinLength(8)
  Password: string;
}
