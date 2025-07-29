import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const SALT = this.config.get<number>('SALT')!;
      const hashedPassword = await bcrypt.hash(dto.password, SALT);

      const existingUser = await this.userRepository.findUserByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException(
          'Пользователь с таким email уже существует',
        );
      }
      const user = await this.userRepository.createUser({
        ...dto,
        password: hashedPassword,
      });
      if (!user) {
        throw new InternalServerErrorException(
          'Ошибка сервера при создании пользователя',
        );
      }

      return user;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Ошибка сервера при создании пользователя',
      );
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const data: Prisma.UserUpdateInput = {};

    try {
      if (dto.email) {
        const existingUser = await this.userRepository.findUserByEmail(
          dto.email,
        );
        if (existingUser) {
          throw new ConflictException(
            'Пользователь с таким email уже существует',
          );
        }

        data.email = dto.email;
      }

      if (dto.newPassword) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Нужен старый пароль');
        }

        const user = await this.userRepository.findUserById(userId);
        if (!user) {
          throw new BadRequestException('Пользователь не найден');
        }
        const ok = await bcrypt.compare(user.passwordHash, dto.currentPassword);
        if (!ok) {
          throw new UnauthorizedException('Пароли не совпадают');
        }

        const SALT = this.config.get<number>('SALT')!;
        data.passwordHash = await bcrypt.hash(dto.currentPassword, SALT);
      }

      if (dto.name) {
        data.name = dto.name;
      }

      return this.userRepository.updateUser(userId, data);
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при обновлении профиля',
      );
    }
  }

  async deleteUser(id: number): Promise<{ userDelete: boolean }> {
    try {
      const existingUser = await this.userRepository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundException('Пользователь не найден');
      }
      if (existingUser.role === 'ADMIN' || existingUser.role === 'OWNER') {
        throw new BadRequestException(
          'Нельзя удалить администратора или владельца',
        );
      }
      return { userDelete: await this.userRepository.deleteUser(id) };
    } catch (err) {
      throw new InternalServerErrorException(
        'Ошибка сервера при удалении пользователя',
      );
    }
  }
}
