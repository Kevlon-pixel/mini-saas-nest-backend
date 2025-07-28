import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'vl0d1sla8@mail.ru',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123123',
    description: 'Пароль пользователя',
    minLength: 6,
  })
  @Length(6)
  @IsString()
  password: string;
}
