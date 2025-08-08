import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Создать задачу' })
  @Post(':orgId')
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }


  @ApiOperation({ summary: 'Список задач организации' })
  @Get(':orgId')
  async findAll(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.tasksService.findAllByOrganization(orgId);
  }

  @ApiOperation({ summary: 'Получить задачу по ID' })
  @Get('one/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.tasksService.findById(id);
  }

  @ApiOperation({ summary: 'Обновление задачи' })
  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Задача удалена' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
