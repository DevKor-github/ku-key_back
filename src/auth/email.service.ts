import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerityToken(email: string, verifyToken: number): Promise<any> {
    const mailOptions: EmailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: '[Ku-Key] 인증코드를 확인해주세요',
      html: `인증번호 : ${verifyToken}`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
