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

  @ApiOperation({
    summary: 'Вывод всех организаций в которых состоит пользователь',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req) {
    return this.organizationRepository.findAllMemberOrganization(req.user.id);
  }

  @ApiOperation({
    summary: 'Получение данных организации, если пользователь состоит в ней',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.organizationRepository.findUserInOrganization(req.user.id, id);
  }

  @ApiOperation({ summary: 'Обновление данных организации' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.updateOrganization(req.user.id, id, dto);
  }

  @ApiOperation({ summary: 'Удаление организации' })
  @UseGuards(JwtAuthGuard)
  @UsePipes()
  @Delete(':id')
  async deleteOrganization(@Req() req, @Param('id', ParseIntPipe) id: number) {
    console.log(req.user.id, id);
    return this.organizationService.deleteOrganization(req.user.id, id);
  }
}
