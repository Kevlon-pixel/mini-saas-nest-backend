import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { TenantRolesGuard } from '../auth/guards/tenant-roles-guard';
import { TenantRole } from '@prisma/client';
import { TenantRoles } from '../auth/decorators/roles';
import { AddMemberDto } from './dto/add-member.dto';

@ApiBearerAuth('access-token')
@ApiTags('Работа с организациями')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Создание организации' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateOrganizationDto) {
    console.log(req.user.id);
    return this.organizationService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Добавить пользователя в организацию' })
  @UseGuards(JwtAuthGuard)
  @Post(':orgId/members')
  async addMember(
    @Req() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizationService.addMember(req.user.id, orgId, dto);
  }

  @ApiOperation({
    summary: 'Получение списка пользователей организации',
  })
  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.ADMIN, TenantRole.OWNER)
  @Get(':orgId/members')
  async getListUsers(@Req() req, @Param('orgId', ParseIntPipe) orgId: number) {
    return this.organizationRepository.findAllOrgMem(orgId);
  }

  @ApiOperation({
    summary: 'Вывод всех организаций в которых состоит пользователь',
  })
  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @Get()
  async list(@Req() req) {
    return this.organizationRepository.findAllMemOrg(req.user.id);
  }

  @ApiOperation({
    summary: 'Получение данных организации, если пользователь состоит в ней',
  })
  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @Get(':id')
  async get(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.organizationRepository.findUserInOrg(req.user.id, id);
  }

  @ApiOperation({ summary: 'Обновление данных организации' })
  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.ADMIN, TenantRole.OWNER)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.updateOrg(id, dto);
  }

  @ApiOperation({ summary: 'Удаление организации' })
  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER)
  @UsePipes()
  @Delete(':id')
  async deleteOrganization(@Req() req, @Param('id', ParseIntPipe) id: number) {
    console.log(req.user.id, id);
    return this.organizationService.deleteOrganization(req.user.id, id);
  }
}
