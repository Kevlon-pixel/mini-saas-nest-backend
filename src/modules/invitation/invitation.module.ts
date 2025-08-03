import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { MailerModule } from '../mailer/mailer.module';
import { MailerService } from '../mailer/mailer.service';
import { OrganizationModule } from '../organization/organization.module';
import { OrganizationRepository } from '../organization/organization.repository';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { OrgMemberGuard } from '../auth/guards/org-member-guard';
import { TenantRolesGuard } from '../auth/guards/tenant-roles-guard';

@Module({
  imports: [JwtModule, MailerModule, OrganizationModule, PrismaModule],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    JwtAuthGuard,
    MailerService,
    OrganizationRepository,
    PrismaService,
    OrgMemberGuard,
    TenantRolesGuard,
  ],
})
export class InvitationModule {}
