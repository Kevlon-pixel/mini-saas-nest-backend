import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { UserRepository } from 'src/modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; message: string }> {
    try {
      const user = await this.userService.createUser(dto);

      return { message: 'Пользователь создан успешно', user };
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
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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

      const { accessToken, refreshToken, expiresAt } =
        await this.tokenService.generateTokens(user);

      return { accessToken, refreshToken, expiresAt };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Ошибка сервера при входе');
    }
  }
}
