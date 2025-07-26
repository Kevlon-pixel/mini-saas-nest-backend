import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRepository } from './user.repository';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @ApiOperation({ summary: 'Обновление профиля пользователя' })
  @Patch('me')
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @Delete(':userId')
  async deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.deleteUser(userId);
  }

  @ApiOperation({ summary: 'Получение данных всех пользователей' })
  @Get()
  async getAllUsers() {
    return this.userRepository.findAllUsers();
  }
}
