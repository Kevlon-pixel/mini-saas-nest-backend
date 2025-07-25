import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/refresh.dto';
import { User } from '@prisma/client';
import { UserRepository } from 'src/modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async generateRefreshToken(user: User): Promise<string> {
    const tokenId = randomUUID();

    const payload = { sub: user.id, jti: tokenId, role: user.role };

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!,
    });

    const tokenHash = await bcrypt.hash(tokenId, Number(process.env.SALT!));
    const expiresAt = new Date();
    const ttl = ms(process.env.REFRESH_TOKEN_EXPIRES_IN!);
    expiresAt.setDate(expiresAt.getDate() + ttl);

    try {
      await this.prisma.refreshToken.create({
        data: {
          id: tokenId,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          'Данный токен уже существует, пройдите пожалуйста аутентификацию повторно',
        );
      }
      throw new InternalServerErrorException('Не удалось создать токен');
    }

    return refreshToken;
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    try {
      const user = await this.userService.createUser(dto);
      if (!user) {
        throw new InternalServerErrorException(
          'Ошибка сервера при создании пользователя',
        );
      }

      return { message: 'Пользователь успешно зарегистрирован' };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw new InternalServerErrorException('Ошибка сервера при регистрации');
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userRepository.findUserByEmail(dto.email);
      if (!user) {
        throw new ConflictException('Пользователь не найден');
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный пароль');
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwt.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      });

      const refreshToken = await this.generateRefreshToken(user);

      return { accessToken, refreshToken };
    } catch (err) {
      throw new InternalServerErrorException('Ошибка сервера при входе');
    }
  }
}
