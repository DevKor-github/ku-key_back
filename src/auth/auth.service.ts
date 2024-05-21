import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/jwtToken.dto';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { EmailService } from './email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccessTokenDto } from './dto/accessToken.dto';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { KuVerificationRepository } from './ku-verification.repository';
import { ScreenshotVerificationResponseDto } from './dto/screenshot-verification-response.dto';
import { ConfigService } from '@nestjs/config';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';
import { FileService } from './file.service';
import { UserService } from 'src/user/user.service';

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
      throw new BadRequestException('이메일이 잘못되었습니다.');
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async createToken(user: AuthorizedUserDto): Promise<JwtTokenDto> {
    const id = user.id;
    const tokenDto = new JwtTokenDto(
      this.createAccessToken(user),
      this.createRefreshToken(id),
    );
    const isset = await this.userService.setCurrentRefresthToken(
      tokenDto.refreshToken,
      id,
    );
    if (!isset) {
      throw new NotImplementedException('update refresh token failed!');
    }
    return tokenDto;
  }

  createAccessToken(user: AuthorizedUserDto): string {
    const payload = {
      id: user.id,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '30m',
    });
  }

  createRefreshToken(id: number): string {
    return this.jwtService.sign(
      { id },
      {
        expiresIn: '2w',
      },
    );
  }

  async refreshTokenMatches(
    refreshToken: string,
    id: number,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userService.findUserById(id);
    const isMatches = await compare(refreshToken, user.refreshToken);

    if (!isMatches) {
      throw new BadRequestException('refreshToken is not matched!');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async logIn(user: AuthorizedUserDto): Promise<LoginResponseDto> {
    const verified = await this.userService.checkUserVerified(user.id);
    const token = await this.createToken(user);
    return new LoginResponseDto(token, verified);
  }

  refreshToken(user: AuthorizedUserDto): AccessTokenDto {
    const accessToken = this.createAccessToken(user);
    return new AccessTokenDto(accessToken);
  }

  async requestEmailVerification(
    email: string,
  ): Promise<VerificationResponseDto> {
    const verifyToken = this.generateRandomNumber();
    console.log('caching data: ', email, verifyToken);
    await this.cacheManager.set(email, verifyToken);
    await this.emailService.sendVerityToken(email, verifyToken);
    return new VerificationResponseDto(true);
  }

  async verifyEmail(
    email: string,
    verifyToken: number,
  ): Promise<VerifyEmailResponseDto> {
    const cache_verifyToken = await this.cacheManager.get(email);
    if (!cache_verifyToken) {
      throw new NotFoundException('해당 메일로 전송된 인증번호가 없습니다.');
    } else if (cache_verifyToken !== verifyToken) {
      throw new UnauthorizedException('인증번호가 일치하지 않습니다.');
    } else {
      await this.cacheManager.del(email);
      return new VerifyEmailResponseDto(true);
    }
  }

  private generateRandomNumber(): number {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  async createScreenshotRequest(
    screenshot: Express.Multer.File,
    studentNumber: number,
    userId: number,
  ): Promise<VerificationResponseDto> {
    //이미 등록된 학번인지 확인
    const requests =
      await this.kuVerificationRepository.findRequestsByStudentNumber(
        studentNumber,
      );
    if (requests) {
      for (const request of requests) {
        if (request.user.isVerified) {
          throw new BadRequestException('student number already exists!');
        }
      }
    }

    //이미 요청을 보냈던 유저인지 확인(그렇다면 원래 요청 수정)
    const user = await this.userService.findUserById(userId);
    const userRequest =
      await this.kuVerificationRepository.findRequestByUser(user);
    if (userRequest) {
      await this.fileService.deleteFile(userRequest.imgDir);

      const filename = await this.fileService.uploadFile(
        screenshot,
        'KuVerification',
        'screenshot',
      );

      const isModified =
        await this.kuVerificationRepository.modifyVerificationRequest(
          userRequest,
          filename,
          studentNumber,
          user,
        );
      if (!isModified) {
        throw new NotImplementedException('verify request failed!');
      }
      return new ScreenshotVerificationResponseDto(true, studentNumber);
    }

    //요청 생성
    const filename = await this.fileService.uploadFile(
      screenshot,
      'KuVerification',
      'screenshot',
    );

    await this.kuVerificationRepository.createVerificationRequest(
      filename,
      studentNumber,
      user,
    );

    return new ScreenshotVerificationResponseDto(true, studentNumber);
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
          imgDir:
            'https://kukey.s3.ap-northeast-2.amazonaws.com/' + request.imgDir,
          studentNumber: request.studentNumber,
          lastUpdated: request.updatedAt,
        };
        return result;
      });
    return results;
  }

  async verifyScreenshotReqeust(
    id: number,
    verify: boolean,
  ): Promise<VerifyScreenshotResponseDto> {
    const request = await this.kuVerificationRepository.findRequestById(id);
    if (verify) {
      const userId = request.user.id;
      const isVerified = await this.userService.verifyUser(userId, verify);
      if (!isVerified) {
        throw new NotImplementedException('reqeust allow failed!');
      }
      const requests =
        await this.kuVerificationRepository.findRequestsByStudentNumber(
          request.studentNumber,
        );
      for (const otherRequest of requests) {
        if (otherRequest.id === request.id) {
          continue;
        }

        await this.fileService.deleteFile(otherRequest.imgDir);

        const isDeleted =
          await this.kuVerificationRepository.deleteVerificationRequest(
            otherRequest.id,
          );
        if (!isDeleted) {
          throw new NotImplementedException(
            'remove other reqeusts with same student number failed!',
          );
        }
      }
    } else {
      await this.fileService.deleteFile(request.imgDir);
      const isDeleted =
        await this.kuVerificationRepository.deleteVerificationRequest(id);
      if (!isDeleted) {
        throw new NotImplementedException('reqeust refection failed!');
      }
    }
    return new VerifyScreenshotResponseDto(true);
  }
}
