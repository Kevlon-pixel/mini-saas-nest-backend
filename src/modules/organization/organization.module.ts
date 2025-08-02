import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationRepository } from './organization.repository';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository, JwtAuthGuard, PrismaService],
})
export class OrganizationModule {}
