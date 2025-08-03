import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Prisma, TenantRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async create(userId: number, dto: CreateOrganizationDto) {
    const existingOrganization =
      await this.organizationRepository.findOrganizationByName(dto.name);
    if (existingOrganization) {
      throw new BadRequestException('Такая организация уже существует');
    }

    const organization = this.organizationRepository.createOrganization(
      userId,
      dto,
    );

    if (!organization) {
      throw new InternalServerErrorException('Не удалось создать оргизацию');
    }

    return organization;
  }

  async addMember(actorId: number, orgId: number, dto: AddMemberDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, ownerId: true },
    });
    if (!org) throw new NotFoundException('Организация не найдена');

    if (actorId !== org.ownerId) {
      const actorMembership = await this.prisma.membership.findUnique({
        where: {
          userId_organizationId: { userId: actorId, organizationId: orgId },
        },
        select: { role: true },
      });
      const isAdmin =
        actorMembership?.role === 'ADMIN' || actorMembership?.role === 'OWNER';
      if (!isAdmin) throw new ForbiddenException('Недостаточно прав');
    }

    const user = await this.userRepository.findUserById(dto.userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const existing = await this.organizationRepository.findUserInOrganization(
      dto.userId,
      orgId,
    );
    if (existing)
      throw new ConflictException('Пользователь уже состоит в организации');

    const role: TenantRole = dto.role ?? 'MEMBER';

    const membership = await this.prisma.membership.create({
      data: {
        userId: dto.userId,
        organizationId: orgId,
        role,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await this.prisma.organization.update({
      where: {
        id: membership.organizationId,
      },
      data: {
        countOfMembers: { increment: 1 },
      },
    });
    return membership;
  }

  async updateOrganization(
    userId: number,
    organizationId: number,
    dto: UpdateOrganizationDto,
  ) {
    const data: Prisma.OrganizationUpdateInput = {};

    try {
      const organization =
        await this.organizationRepository.findOrganizationById(organizationId);

      if (!organization) {
        throw new BadRequestException('Заданной организации не существует');
      }
      if (dto.name) {
        const existingByName =
          await this.organizationRepository.findOrganizationByName(dto.name);
        if (existingByName) {
          throw new ConflictException(
            'Организация с таким именем уже существует',
          );
        }

        if (dto.name) {
          data.name = dto.name;
        }
      }

      return this.organizationRepository.update(organization.id, data);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка сервера при обновлении организации',
      );
    }
  }

  async deleteOrganization(
    userId: number,
    organizationId: number,
  ): Promise<{ userDelete: boolean }> {
    try {
      const existingOrganization =
        await this.organizationRepository.findOrganizationById(organizationId);
      if (!existingOrganization) {
        throw new NotFoundException('Организация не найдена');
      }
      if (existingOrganization.ownerId !== userId) {
        throw new BadRequestException(
          'Для удаления вы должны быть владельцем организации',
        );
      }
      return {
        userDelete: await this.organizationRepository.delete(organizationId),
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при удалении пользователя',
      );
    }
  }
}
