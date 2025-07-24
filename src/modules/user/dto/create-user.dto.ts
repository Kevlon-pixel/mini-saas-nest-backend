import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum UserRoles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @Length(6)
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsEnum(UserRoles)
  role: UserRoles;
}
