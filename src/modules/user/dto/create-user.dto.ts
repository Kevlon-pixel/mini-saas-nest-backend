import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '@prisma/client';

import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';

export class CreateUserDto extends RegisterDto {
  @ApiProperty({ example: 'vl0d1sla8', description: 'Имя пользователя' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'USER', description: 'Роль пользователя' })
  @IsOptional()
  @IsEnum(RolesEnum)
  role?: RolesEnum;
}
