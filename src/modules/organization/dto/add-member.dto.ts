import { ApiProperty } from '@nestjs/swagger';
import { TenantRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    example: '1',
    description: 'id пользователя',
  })
  @IsString({ message: 'id пользователя должно быть числом' })
  userId: number;

  @IsOptional()
  @IsEnum(TenantRole, { message: 'id одним из возможных в enum' })
  role?: TenantRole;
}
