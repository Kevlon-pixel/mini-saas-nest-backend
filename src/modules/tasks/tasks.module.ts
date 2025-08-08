import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { OrganizationModule } from '../organization/organization.module';
import { OrganizationRepository } from '../organization/organization.repository';
import { TasksRepository } from './tasks.repository';

@Module({
  imports: [JwtModule, PrismaModule, OrganizationModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    TasksRepository,
    JwtAuthGuard,
    PrismaService,
    OrganizationRepository,
  ],
})
export class TasksModule {}
