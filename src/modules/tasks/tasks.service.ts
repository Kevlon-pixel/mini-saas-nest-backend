import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { OrganizationRepository } from '../organization/organization.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepostiory: TasksRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(dto: CreateTaskDto, userId: number) {
    try {
      const org = this.organizationRepository.findOrgById(dto.organizationId);
      if (!org) throw new NotFoundException('Организация не найдена');

      let dueDate: Date | null = null;
      if (typeof dto.dueDate === 'number') {
        const now = new Date();
        dueDate = new Date(now);
        dueDate.setUTCDate(dueDate.getDate() + dto.dueDate);
      }

      const task = this.taskRepostiory.createTask(
        dto.organizationId,
        userId,
        dto.title,
        dto.description ?? '',
        dueDate,
      );

      return task;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Не удалось создать задание');
    }
  }

  async findById(id: number): Promise<Task> {
    console.log(id);
    try {
      const task = await this.taskRepostiory.findTaskById(id);
      if (!task) {
        throw new NotFoundException('Задача не найдена');
      }
      return task;
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при получении задачи',
      );
    }
  }

  async findAllByOrganization(organizationId: number) {
    try {
      return await this.taskRepostiory.findAllByOrganization(organizationId);
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при получении задач организации',
      );
    }
  }

  async findAllByCreator(createdByUserId: number) {
    try {
      return await this.taskRepostiory.findAllByCreator(createdByUserId);
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при получении задач пользователя',
      );
    }
  }

  async updateTask(taskId: number, dto: UpdateTaskDto, userId: number) {
    const data: Prisma.TaskUpdateInput = {};
    try {
      const task = await this.taskRepostiory.findTaskById(taskId);
      if (!task) throw new NotFoundException('Задача не найдена');

      if (dto.title !== undefined) data.title = dto.title.trim();
      if (dto.description !== undefined) data.description = dto.description;
      if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;

      if (dto.dueDate !== undefined) {
        const now = new Date();
        const dueDate = new Date(now);
        dueDate.setUTCDate(dueDate.getUTCDate() + dto.dueDate);
        data.dueDate = dueDate;
      }
      const updated = await this.taskRepostiory.updateTask(taskId, data);

      return updated;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка сервера при обновлении задачи',
      );
    }
  }

  async remove(id: number): Promise<Task> {
    try {
      const exists = await this.taskRepostiory.findTaskById(id);
      if (!exists) {
        throw new NotFoundException('Задача не найдена');
      }

      const task = await this.taskRepostiory.removeTask(id);
      if (!task) {
        throw new InternalServerErrorException(
          'Ошибка сервера при удалении задачи',
        );
      }

      return task;
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при удалении задачи',
      );
    }
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
