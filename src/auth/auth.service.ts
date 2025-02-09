import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/jwtToken.dto';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { EmailService } from 'src/common/email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { KuVerificationRepository } from './ku-verification.repository';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { ConfigService } from '@nestjs/config';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';
import { FileService } from 'src/common/file.service';
import { UserService } from 'src/user/user.service';
import { checkPossibleResponseDto } from 'src/user/dto/check-possible-response.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { SendTempPasswordResponseDto } from './dto/send-temporary-password.dto';
import { EntityManager } from 'typeorm';
import { throwKukeyException } from 'src/utils/exception.util';
import { Webhook } from 'discord-webhook-node';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(KuVerificationRepository)
    private readonly kuVerificationRepository: KuVerificationRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throwKukeyException('INVALID_EMAIL');
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throwKukeyException('INVALID_PASSWORD');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async createToken(
    user: AuthorizedUserDto,
    keepingLogin: boolean,
    deviceCode: string,
  ): Promise<JwtTokenDto> {
    const id = user.id;

    const tokenDto = new JwtTokenDto(
      this.createAccessToken(user),
      this.createRefreshToken(user, keepingLogin, deviceCode),
    );

    const hashedToken = await argon2.hash(tokenDto.refreshToken);
    await this.cacheManager.set(
      `token-${id}-${deviceCode}`,
      hashedToken,
      1000 * 60 * 60 * 24 * (keepingLogin ? 14 : 2),
    );
    return tokenDto;
  }

  createAccessToken(user: AuthorizedUserDto): string {
    const payload = {
      id: user.id,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '5m',
    });
  }

  createRefreshToken(
    user: AuthorizedUserDto,
    keepingLogin: boolean,
    deviceCode: string,
  ): string {
    const expiresIn = keepingLogin ? '14d' : '2d';
    return this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        keepingLogin: keepingLogin,
        deviceCode: deviceCode,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: expiresIn,
      },
    );
  }

  async refreshTokenMatches(
    refreshToken: string,
    id: number,
    deviceCode: string,
  ): Promise<void> {
    const existingToken: string = await this.cacheManager.get(
      `token-${id}-${deviceCode}`,
    );

    if (!existingToken) {
      throwKukeyException('LOGIN_REQUIRED');
    }

    const isMatches = await argon2.verify(existingToken, refreshToken);

    if (!isMatches) {
      throwKukeyException('REFRESH_TOKEN_NOT_MATCHED');
    }
  }

  async logIn(
    user: AuthorizedUserDto,
    keepingLogin: boolean,
  ): Promise<LoginResponseDto> {
    const verified = await this.userService.checkUserVerified(user.id);
    const deviceCode = this.generateRandomString(10) + Date.now().toString();
    const token = await this.createToken(user, keepingLogin, deviceCode);
    return new LoginResponseDto(token, verified, deviceCode, user.id);
  }

  async logout(user: AuthorizedUserDto, deviceCode: string) {
    if (deviceCode) {
      await this.cacheManager.del(`token-${user.id}-${deviceCode}`);
    } else {
      const keys = await this.cacheManager.store.keys(`token-${user.id}-*`);
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
    }
    return new LogoutResponseDto(true);
  }

  async refreshToken(user: AuthorizedUserDto): Promise<JwtTokenDto> {
    const jwtToken = await this.createToken(
      user,
      user.keepingLogin,
      user.deviceCode,
    );
    return jwtToken;
  }

  async requestEmailVerification(
    email: string,
  ): Promise<VerificationResponseDto> {
    const verifyToken = this.generateRandomNumber();
    console.log('caching data: ', email, verifyToken);
    await this.cacheManager.set(
      `emailverify-${email}`,
      verifyToken,
      1000 * 60 * 5,
    );
    await this.emailService.sendVerityToken(email, verifyToken);
    return new VerificationResponseDto(true);
  }

  async verifyEmail(
    email: string,
    verifyToken: number,
  ): Promise<VerifyEmailResponseDto> {
    const cache_verifyToken = await this.cacheManager.get(
      `emailverify-${email}`,
    );
    if (!cache_verifyToken) {
      throwKukeyException('VERIFY_TOKEN_NOT_FOUND');
    } else if (cache_verifyToken !== verifyToken) {
      throwKukeyException('INVALID_VERIFY_TOKEN');
    } else {
      await this.cacheManager.del(`emailverify-${email}`);
      return new VerifyEmailResponseDto(true);
    }
  }

  private generateRandomNumber(): number {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  async checkStudentNumberPossible(
    studentNumber: number,
  ): Promise<checkPossibleResponseDto> {
    const requests =
      await this.kuVerificationRepository.findRequestsByStudentNumber(
        studentNumber,
      );
    if (requests) {
      for (const request of requests) {
        if (request.user.isVerified) {
          return new checkPossibleResponseDto(false);
        }
      }
    }

    return new checkPossibleResponseDto(true);
  }

  async createUserandScreenshotRequest(
    transactionManager: EntityManager,
    screenshot: Express.Multer.File,
    requestDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    if (!this.fileService.imagefilter(screenshot)) {
      throwKukeyException('NOT_IMAGE_FILE');
    }

    //유저생성
    const user = await this.userService.createUser(transactionManager, {
      email: requestDto.email,
      password: requestDto.password,
      username: requestDto.username,
      name: requestDto.name,
      country: requestDto.country,
      homeUniversity: requestDto.homeUniversity,
      major: requestDto.major,
    });

    await this.userService.createUserCharacter(transactionManager, user.id);

    const studentNumber = requestDto.studentNumber;

    //요청 생성
    const filename = await this.fileService.uploadFile(
      screenshot,
      'KuVerification',
      'screenshot',
    );

    await this.kuVerificationRepository.createVerificationRequest(
      transactionManager,
      filename,
      studentNumber,
      user,
    );

    const discordUrl = await this.configService.get('DISCORD_WEBHOOK_URL');
    const hook = new Webhook(discordUrl);
    const totalUsers = await this.userService.getTotalUsersCount();

    await hook
      .send(
        'The ' +
          totalUsers +
          'th user has signed up for KU-KEY! (' +
          studentNumber +
          ')',
      )
      .then(() => console.log('Sent new user request to discord'))
      .catch((err) => console.log(err.message));

    return new SignUpResponseDto(true, studentNumber);
  }

  validateAdmin(id: string, password: string): boolean {
    return (
      id === this.configService.get('ADMIN_ID') &&
      password === this.configService.get('ADMIN_PASSWORD')
    );
  }

  async getScreenshotVerifyRequests(): Promise<
    GetScreenshotVerificationsResponseDto[]
  > {
    const requests = await this.kuVerificationRepository.getRequests();
    const results = requests
      .filter((request) => !request.user.isVerified)
      .map((request) => {
        const result: GetScreenshotVerificationsResponseDto = {
          id: request.id,
          imgDir: this.fileService.makeUrlByFileDir(request.imgDir),
          studentNumber: request.studentNumber,
          lastUpdated: request.updatedAt,
        };
        return result;
      });
    return results;
  }

  async verifyScreenshotRequest(
    id: number,
    verify: boolean,
  ): Promise<VerifyScreenshotResponseDto> {
    const request = await this.kuVerificationRepository.findRequestById(id);
    const userId = request.user.id;
    const user = await this.userService.findUserById(userId);
    if (verify) {
      const isVerified = await this.userService.verifyUser(userId, verify);
      if (!isVerified) {
        throwKukeyException('USER_VERIFICATION_FAILED');
      }

      // 동일 학번의 다른 요청 reject
      const requests =
        await this.kuVerificationRepository.findRequestsByStudentNumber(
          request.studentNumber,
        );
      for (const otherRequest of requests) {
        if (otherRequest.id === request.id) {
          continue;
        }

        await this.deleteRequest(otherRequest.id);
        await this.emailService.sendVerifyCompleteEmail(user.email, false);
      }
    } else {
      await this.deleteRequest(request.id);
    }

    await this.emailService.sendVerifyCompleteEmail(user.email, verify);

    return new VerifyScreenshotResponseDto(true);
  }

  async deleteRequest(requestId: number): Promise<void> {
    const request =
      await this.kuVerificationRepository.findRequestById(requestId);
    await this.userService.hardDeleteUser(request.user.id);
    await this.fileService.deleteFile(request.imgDir);
  }

  async updatePassword(
    userId: number,
    newPassword: string,
  ): Promise<ChangePasswordResponseDto> {
    const updateResult = await this.userService.updatePassword(
      userId,
      newPassword,
    );
    if (!updateResult) {
      throwKukeyException('PASSWORD_UPDATE_FAILED');
    }

    return new ChangePasswordResponseDto(updateResult);
  }

  async sendTemporaryPassword(
    email: string,
  ): Promise<SendTempPasswordResponseDto> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throwKukeyException('USER_NOT_FOUND');
    }

    const tempPassword = this.generateRandomString(10);

    const isUpdated = await this.userService.updatePassword(
      user.id,
      tempPassword,
    );
    if (!isUpdated) {
      throwKukeyException('PASSWORD_UPDATE_FAILED');
    }
    await this.emailService.sendTempPassword(email, tempPassword);
    return new SendTempPasswordResponseDto(true);
  }

  generateRandomString(len: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
