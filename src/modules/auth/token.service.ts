import {
  ConflictException,
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

@Injectable()
export class TokenService {
  constructor(
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
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN!,
      },
    );

    const refreshToken = this.jwt.sign(
      {
        sub: user.id,
        jti: tokenId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!,
      },
    );

    const expiresAt = new Date();
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!);
    expiresAt.setDate(expiresAt.getDate() + days);

    const tokenHash = await bcrypt.hash(tokenId, Number(process.env.SALT!));

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
      console.error(err);
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
