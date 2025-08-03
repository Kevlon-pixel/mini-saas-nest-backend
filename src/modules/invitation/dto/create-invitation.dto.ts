// dto/create-invitation.dto.ts
import { IsEmail, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { TenantRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    example: '1@email.ru',
    description: 'Email пользователя которого нужно пригласить',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MEMBER',
    description: 'Роль которая будет выдана новому члену организации',
  })
  @IsOptional()
  @IsEnum(TenantRole)
  role: TenantRole;

  @ApiProperty({
    example: 7,
    description: 'Дни жизни приглашения',
  })
  @IsOptional()
  @IsInt()
  expiresInDays?: number;
}
