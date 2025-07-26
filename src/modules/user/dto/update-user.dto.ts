import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'vl0d1sla8',
    description: 'Имя пользователя',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'vl0d1sla8@mail.ru',
    description: 'Email пользователя',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '321321',
    description: 'Новый пароль',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @ApiProperty({
    example: '123123',
    description: 'Текущий пароль',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  currentPassword?: string;
}

export class UpdateUserDto extends PartialType(UpdateProfileDto) {
  @ApiProperty({ example: 'USER', description: 'Роль пользователя' })
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
