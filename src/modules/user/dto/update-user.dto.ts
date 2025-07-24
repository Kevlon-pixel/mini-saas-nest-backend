import { PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  currentPassword?: string;
}

export class UpdateUserDto extends PartialType(UpdateProfileDto) {
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
