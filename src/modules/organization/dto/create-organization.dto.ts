import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Sberbank',
    description: 'Имя организации',
  })
  @IsString({ message: 'имя организации должно быть строкой' })
  name: string;
}
