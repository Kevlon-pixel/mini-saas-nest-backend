import { PrismaService } from 'prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    dto: CreateOrganizationDto,
  ): Promise<Organization | null> {
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    if (!organization) {
      return null;
    }

    return organization;
  }

  async findOrgByName(name: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        name: name,
      },
    });

    if (!organization) {
      return null;
    }

    return organization;
  }

  async findOrgById(id: number): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
      },
    });

    if (!organization) {
      return null;
    }

    return organization;
  }

  async findAllOrgMem(organizationId: number) {
    const list = await this.prisma.membership.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return list;
  }

  async findAllMemOrg(userId: number): Promise<Organization[]> {
    const list = await this.prisma.organization.findMany({
      where: {
        memberships: { some: { userId } },
      },
    });

    return list;
  }

  async findUserInOrg(
    userId: number,
    orgId: number,
  ): Promise<Organization | null> {
    const organization = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!organization?.organization) {
      return null;
    }

    return organization.organization;
  }

  async getOrgInfo(organizationId: number) {
    const organization = await this.prisma.organization.findMany({
      include: {
        owner: { select: { id: true, email: true } },
        memberships: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return organization;
  }

  async update(
    id: number,
    data: Prisma.OrganizationUpdateInput,
  ): Promise<Organization | null> {
    const Organization = await this.prisma.organization.update({
      where: { id: id },
      data,
    });

    if (!Organization) {
      return null;
    }

    return Organization;
  }

  async delete(id: number): Promise<boolean> {
    const check = await this.prisma.organization.delete({
      where: {
        id: id,
      },
    });

    if (!check) {
      return false;
    }

    return true;
  }
}
