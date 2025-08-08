import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Id организации',
    example: '2',
  })
  @IsInt()
  organizationId: number;

  @ApiProperty({
    description: 'Короткий заголовок задачи',
    example: 'Подготовить отчёт к понедельнику',
  })
  @IsString({ message: 'title должен быть строкой' })
  @IsNotEmpty({ message: 'title обязателен' })
  title: string;

  @ApiPropertyOptional({
    description: 'Подробное описание задачи',
    example: 'Собрать метрики за неделю и оформить презентацию',
  })
  @IsString({ message: 'description должен быть строкой' })
  description: string;

  @ApiPropertyOptional({
    description: 'Срок выполнения в днях',
    example: '7',
  })
  @IsOptional()
  @IsNumber({}, { message: 'dueDate должен быть числом' })
  dueDate?: number;
}
