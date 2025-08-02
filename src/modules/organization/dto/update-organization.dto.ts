import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({
    example: 'Sberbank',
    description: 'Имя организации',
  })
  @IsString({ message: 'имя организации должно быть строкой' })
  @IsOptional()
  name?: string;
}
