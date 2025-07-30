import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from './modules/mailer/mailer.module';
import configuration from './config/configuration';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        SALT: Joi.number().required(),
        DATABASE_URL_HOST: Joi.string().uri().required(),
        JWT_ACCESS_SECRET: Joi.string().min(8).required(),
        JWT_REFRESH_SECRET: Joi.string().min(8).required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('30m'),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASS: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [],
  providers: [AppService, ConfigService],
  exports: [ConfigService],
})
export class AppModule {}
