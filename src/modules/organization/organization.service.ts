import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
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
