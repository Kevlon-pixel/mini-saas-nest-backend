import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { OrganizationRepository } from '../organization/organization.repository';
import { PrismaService } from 'prisma/prisma.service';
import { randomUUID } from 'crypto';
import { TenantRole } from '@prisma/client';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { getTestMessageUrl } from 'nodemailer';

@Injectable()
export class InvitationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async sendInvitation(
    actorId: number,
    orgId: number,
    dto: CreateInvitationDto,
  ) {
    const org = await this.organizationRepository.findOrgById(orgId);
    if (!org) throw new NotFoundException('Организация не найдена');

    const userIn = !!(await this.prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        user: {
          email: { equals: dto.email, mode: 'insensitive' },
        },
      },
      select: { userId: true },
    }));
    if (userIn) {
      throw new BadRequestException('Пользователь уже состоит в организации');
    }

    const existing = await this.prisma.invitation.findFirst({
      where: {
        organizationId: orgId,
        email: dto.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, token: true, expiresAt: true },
    });
    if (existing) {
      throw new ConflictException(
        'Приглашение уже отправлено и пока действует',
      );
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays || 7));

    const role: TenantRole = dto.role ?? 'MEMBER';

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId: orgId,
        email: dto.email,
        role,
        token,
        expiresAt,
        createdByUserId: actorId,
      },
    });

    const link = `https://localhost:3000/auth/verify?token=${token}`;
    const previewUrl = await this.sendInvitationEmail(
      dto.email,
      org.name,
      role,
      link,
      expiresAt,
    );

    return {
      message: 'Письмо с приглашением отправлено',
      previewUrl,
    };
  }

  async acceptInvitation(userId: number, dto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        expiresAt: true,
        acceptedAt: true,
      },
    });
    if (!invitation) throw new NotFoundException('Приглашение не найдено');
    if (invitation.acceptedAt)
      throw new ConflictException('Приглашение уже принято');
    if (invitation.expiresAt <= new Date())
      throw new GoneException('Срок приглашения истёк');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invitation.organizationId,
        },
      },
      select: { userId: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      if (!existing) {
        await tx.membership.create({
          data: {
            userId,
            organizationId: invitation.organizationId,
            role: invitation.role ?? 'MEMBER',
          },
        });

        await tx.organization.update({
          where: {
            id: invitation.organizationId,
          },
          data: {
            countOfMembers: { increment: 1 },
          },
        });
      }
      const updatedInv = await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
      return updatedInv;
    });

    return { ok: true, organizationId: invitation.organizationId };
  }

  async sendInvitationEmail(
    email: string,
    orgName: string,
    role: string | undefined,
    acceptLink: string,
    expiry: Date,
  ) {
    const info = await this.mailer.sendMail({
      to: email,
      subject: `Приглашение в организацию ${orgName}`,
      template: 'invitation',
      context: {
        orgName,
        role,
        acceptLink,
        expiry,
      },
    });

    const preview = getTestMessageUrl(info);
    console.log('Preview URL:', preview);
    return preview;
  }
}
