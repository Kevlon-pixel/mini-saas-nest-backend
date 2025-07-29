import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-guard';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenService } from './token.service';
import { MailerModule } from '../mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
