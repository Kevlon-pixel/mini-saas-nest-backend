import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    example: 'token-tatata-lalala',
    description: 'uuid токен для подтверждения приглащения',
  })
  @IsString({message: "ну ты че? нужно токен ввести"})
  token: string;
}
