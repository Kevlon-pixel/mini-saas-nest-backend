import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import * as ms from 'ms';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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
}
