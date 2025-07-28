import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { getTestMessageUrl } from 'nodemailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailer: NestMailerService) {}


}
