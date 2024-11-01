import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private nodeMailer: Mail;

  constructor(private readonly configService: ConfigService) {
    this.nodeMailer = createTransport({
      service: configService.get('MAIL_SERVICE'),
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASSWORD'),
      },
    });
  }

  // 메일 전송 로직
  async sendMail(options: Mail.Options) {
    return await this.nodeMailer.sendMail(options);
  }
}
