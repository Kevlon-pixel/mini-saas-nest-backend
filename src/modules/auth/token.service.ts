import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import * as ms from 'ms';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async generateTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const tokenId = randomUUID();

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
      },
    );

    const refreshToken = this.jwt.sign(
      {
        sub: user.id,
        jti: tokenId,
      },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    const expiresAt = new Date();
    const days = parseInt(this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN')!);
    expiresAt.setDate(expiresAt.getDate() + days);

    const SALT = this.config.get<number>('SALT')!;
    const tokenHash = await bcrypt.hash(tokenId, SALT);

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
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Данный токен уже существует, пройдите пожалуйста аутентификацию повторно',
        );
      }
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Не удалось создать токен');
    }

    return { accessToken, refreshToken, expiresAt };
  }

  async revokeOneToken(jti: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: jti },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId: userId },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async deleteRevokedTokens(jti: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { revoked: true },
    });
  }
}
