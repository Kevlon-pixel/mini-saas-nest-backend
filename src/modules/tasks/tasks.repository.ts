import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(
    organizationId: number,
    createdByUserId: number,
    title: string,
    description: string,
    dueDate?: Date | null,
  ): Promise<Task | null> {
    const organization = await this.prisma.task.create({
      data: {
        organizationId,
        createdByUserId,
        title,
        description,
        dueDate: dueDate,
      },
    });

    if (!organization) {
      return null;
    }

    return organization;
  }

  async findTaskById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      return null;
    }

    return task;
  }

  async findAllByOrganization(orgId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId: orgId,
      },
    });

    return tasks;
  }

  async findAllByCreator(orgId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        createdByUserId: orgId,
      },
    });

    return tasks;
  }

  async findAllByUser(userId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        createdByUserId: userId,
      },
    });

    return tasks;
  }

  async updateTask(
    id: number,
    data: Prisma.TaskUpdateInput,
  ): Promise<Task | null> {
    return await this.prisma.task.update({ where: { id }, data });
  }

  async toggleCompleted(
    id: number,
    isCompleted: boolean,
  ): Promise<Task | null> {
    return await this.prisma.task.update({
      where: { id },
      data: { isCompleted },
    });
  }

  async setDueDate(id: number, dueDate: Date | null): Promise<Task | null> {
    return await this.prisma.task.update({ where: { id }, data: { dueDate } });
  }

  async removeTask(id: number): Promise<Task | null> {
    const task = await this.prisma.task.delete({ where: { id } });
    if (!task) {
      return null;
    }

    return task;
  }
}
