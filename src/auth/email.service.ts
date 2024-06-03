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
      subject: '[Ku-Key] Please check your verification code',
      html: `<div style="text-align: center;">
              <h1>🍪KuKey Verification Code</h1>
              <p>This is the code to verify that your email is possible.</p>
              <p>Please finish sign-up by input this code.</p>
              <h2>${verifyToken}</h2>
            </div>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
