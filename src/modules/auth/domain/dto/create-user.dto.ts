import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'User email adress',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password before hashing',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
