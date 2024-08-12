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

  async sendTempPassword(email: string, tempPassword: string): Promise<any> {
    const mailOptions: EmailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: '[Ku-Key] Your temporary password has been issued.',
      html: `<div style="text-align: center;">
              <h1>🍪Temporary password guide</h1>
              <p>Try to log in with the following password.</p>
              <p>Please change the password after that.</p>
              <h2>${tempPassword}</h2>
            </div>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendVerifyCompleteEmail(
    email: string,
    isVerified: boolean,
  ): Promise<any> {
    const title = isVerified
      ? '[Ku-Key] Your account has been verified!'
      : '[Ku-Key] Your account verification failed!';
    //프론트 사이트 배포되면 연결 url 바꿔주기
    const content = isVerified
      ? `<div style="text-align: center;">
          <h1>🍪School Verification Complete!</h1>
          <p>Now you can use KU-key service right now.</p>
          <p>We hope this service will help you a lot in your exchange student life.</p>
          <a href="https://ku-key.devkor.club">
            <button style="width: 209px; padding: 12px 0px; margin: 5px 0px; border-radius: 24px; border: 1px solid #E70000; background: #E70000; color: white";>
              Start now
            </button>
          </a>
        </div>`
      : `<div style="text-align: center;">
          <h1>🍪School Verification Failed!</h1>
          <p>We have some difficulty verifying you as a Korea University student in your screenshot.</p>
          <p>Please try to sign up again with a clearer screen shot.</p>
          <a href="https://ku-key.devkor.club/register">
            <button style="width: 209px; padding: 12px 0px; margin: 5px 0px; border-radius: 24px; border: 1px solid #E70000; background: #E70000; color: white";>
              Try again
            </button>
          </a>
        </div>`;
    const mailOptions: EmailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: title,
      html: content,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
