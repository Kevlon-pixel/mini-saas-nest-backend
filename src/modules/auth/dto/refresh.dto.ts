import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'fu1h389h0...',
    description: 'Refresh токен пользователя',
  })
  @IsString()
  refreshToken: string;
}
