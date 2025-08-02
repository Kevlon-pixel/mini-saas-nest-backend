import {
  BadRequestException,
  ConflictException,
  HttpException,
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
import { randomUUID } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { format } from 'date-fns';
import { getTestMessageUrl } from 'nodemailer';
import { error } from 'console';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailer: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    Promise<{ message: string; previewUrl: string }>;
    try {
      const now = new Date();
      const existing = await this.userRepository.findUserByEmail(dto.email);
      if (existing) {
        if (existing.isEmailVerified) {
          throw new ConflictException('Пользователь уже зарегистрирован');
        }

        if (existing.emailVerificationTokenExpire! > now) {
          throw new BadRequestException(
            'Ссылка ещё действительна, проверьте почту',
          );
        }

        const token = randomUUID();

        const expires = new Date();
        const msInHour = 60 * 60 * 1000;
        const newExpires = new Date(expires.getTime() + msInHour);

        await this.userRepository.updateEmailVerifyToken(
          existing.id,
          token,
          newExpires,
        );

        const link = `https://localhost:3000/auth/verify?token=${token}`;
        const previewUrl = await this.sendVerification(
          existing.email,
          link,
          newExpires,
        );

        return {
          message: 'Письмо с подтверждением отправлено повторно',
          previewUrl,
        };
      }

      const user = await this.userService.createUser(dto);

      const token = randomUUID();

      const expires = new Date();
      const msInHour = 60 * 60 * 1000;
      const newExpires = new Date(expires.getTime() + msInHour);

      await this.userRepository.updateEmailVerifyToken(
        user.id,
        token,
        newExpires,
      );

      const link = `https://localhost:3000/auth/verify?token=${token}`;
      const previewUrl = await this.sendVerification(
        user.email,
        link,
        newExpires,
      );

      return {
        message: 'Письмо с ссылкой отправлено на почту',
        previewUrl,
      };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      if (err instanceof HttpException) {
        throw err;
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

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Email пользователя не подтвержден');
      }

      const { accessToken, refreshToken, expiresAt } =
        await this.tokenService.generateTokens(user.id);

      return { accessToken, refreshToken, expiresAt };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error(err);
      throw new InternalServerErrorException('Ошибка сервера при входе');
    }
  }

  async logout(userId: number): Promise<void> {
    const user = this.userRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    await this.tokenService.revokeAllTokens(userId);
  }

  async refresh(
    oldToken,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    let payload;
    try {
      payload = this.jwt.verify(oldToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException(
        'Некорректный или просроченный refresh токен',
      );
    }

    const record = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh токен не найден или истек');
    }

    this.tokenService.revokeOneToken(payload.jti);

    const { accessToken, refreshToken, expiresAt } =
      await this.tokenService.generateTokens(payload.sub);

    return { accessToken, refreshToken, expiresAt };
  }

  async verifyEmail(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const user = await this.userRepository.findUserByEmailToken(token);
    if (!user) {
      throw new BadRequestException('Неверный токен');
    }

    if (user.emailVerificationTokenExpire! < new Date()) {
      throw new BadRequestException('Токен истёк');
    }

    await this.userRepository.updateEmailVerify(user.id);

    const { accessToken, refreshToken, expiresAt } =
      await this.tokenService.generateTokens(user.id);

    return { accessToken, refreshToken, expiresAt };
  }

  async sendVerification(email: string, link: string, expiry: Date) {
    const info = await this.mailer.sendMail({
      to: email,
      subject: 'Подтверждение почты',
      template: 'verify-email',
      context: { link, expiry },
    });

    const preview = getTestMessageUrl(info);
    console.log('Preview URL:', preview);
    return preview;
  }
}
