import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { compare, hash } from 'bcrypt';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(KuVerificationRepository)
    private readonly kuVerificationRepository: KuVerificationRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userRepository.findUserByEmail(email);

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
    const isset = await this.setCurrentRefresthToken(tokenDto.refreshToken, id);
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

  async setCurrentRefresthToken(
    refreshToken: string,
    id: number,
  ): Promise<boolean> {
    const hashedToken = await hash(refreshToken, 10);

    return await this.userRepository.setCurrentRefreshToken(id, hashedToken);
  }

  async refreshTokenMatches(
    refreshToken: string,
    id: number,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userRepository.findUserById(id);
    const isMatches = await compare(refreshToken, user.refreshToken);

    if (!isMatches) {
      throw new BadRequestException('refreshToken is not matched!');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async logIn(user: AuthorizedUserDto): Promise<LoginResponseDto> {
    const verified = (await this.userRepository.findUserById(user.id))
      .isVerified;
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

  async checkUserVerified(userId: number): Promise<AuthorizedUserDto> {
    const user = await this.userRepository.findUserById(userId);
    if (!user.isVerified) {
      throw new BadRequestException('user is not verified!');
    } else {
      return new AuthorizedUserDto(user.id, user.username);
    }
  }

  async createScreenshotRequest(
    screenshot: Express.Multer.File,
    studentNumber: number,
    userId: number,
  ): Promise<VerificationResponseDto> {
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

    const user = await this.userRepository.findUserById(userId);
    const userRequest =
      await this.kuVerificationRepository.findRequestByUser(user);
    if (userRequest) {
      //
      //원래 스크린샷 파일 삭제 코드 필요
      //
      const isModified =
        await this.kuVerificationRepository.modifyVerificationRequest(
          userRequest,
          screenshot.path,
          studentNumber,
          user,
        );
      if (!isModified) {
        throw new NotImplementedException('Profile setting failed!');
      }
      return new VerificationResponseDto(true);
    }

    await this.kuVerificationRepository.createVerificationRequest(
      screenshot.path,
      studentNumber,
      user,
    );

    return new VerificationResponseDto(true);
  }
}
