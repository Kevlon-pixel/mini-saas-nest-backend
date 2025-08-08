import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Новый заголовок',
    example: 'Обновлённый заголовок',
  })
  @IsOptional()
  @IsString({ message: 'title должен быть строкой' })
  @IsNotEmpty({ message: 'title не может быть пустым' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Новое описание',
    example: 'Уточнённое описание задачи',
  })
  @IsOptional()
  @IsString({ message: 'description должен быть строкой' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Флаг завершения',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isCompleted должен быть булевым значением' })
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Новый срок выполнения',
    example: '7',
  })
  @IsOptional()
  @IsNumber({}, { message: 'dueDate должен быть числом' })
  dueDate?: number;
}
