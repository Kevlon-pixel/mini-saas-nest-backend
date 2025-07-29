import { Module } from '@nestjs/common';
import { MailerModule as NestMailer } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { createTestAccount } from 'nodemailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestMailer.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const testAccount = await createTestAccount();
        return {
          transport: {
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          },
          defaults: { from: `"No Reply" <${config.get<string>('SMTP_USER')}>` },
          template: {
            dir: join(__dirname, '../../../templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailerService, NestMailer],
  exports: [NestMailer, MailerService],
})
export class MailerModule {}
