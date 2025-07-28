import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'uuid-token-from-email',
    description: 'Почтовый токен',
  })
  @IsString()
  token: string;
}
