import { Roles } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @Length(6)
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(Roles)
  role: Roles;
}
