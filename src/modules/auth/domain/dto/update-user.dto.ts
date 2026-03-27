import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsOptional()
  Name?: string;

  @ApiProperty({
    example: '1990-12-29',
    description: 'Date of birth of the user, is in (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  BirthDate?: string;

  @ApiProperty({
    description: 'User password before hashing',
  })
  @MinLength(8)
  @IsOptional()
  Password?: string;
}
