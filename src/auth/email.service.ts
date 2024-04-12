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
      service: 'naver',
      host: 'smtp.naver.com',
      port: 587,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendVerityToken(email: string, verifyToken: number) {
    const mailOptions: EmailOptions = {
      from: 'kimsh4265@naver.com',
      to: email,
      subject: '[Ku-Key] 인증코드를 확인해주세요',
      html: `인증번호 : ${verifyToken}`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
