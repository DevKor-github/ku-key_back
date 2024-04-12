import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('이메일이 잘못되었습니다.');
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return new AuthorizedUserDto(user.id, user.email);
  }

  async createToken(user: AuthorizedUserDto) {
    const id = user.id;
    const tokenDto = new JwtTokenDto(
      this.createAccessToken(user),
      this.createRefreshToken(id),
    );
    await this.setCurrentRefresthToken(tokenDto.refreshToken, id);
    return tokenDto;
  }

  createAccessToken(user: AuthorizedUserDto) {
    const payload = { email: user.email, id: user.id };
    return this.jwtService.sign(payload, {
      expiresIn: '30m',
    });
  }

  createRefreshToken(id: number) {
    return this.jwtService.sign(
      { id },
      {
        expiresIn: '2w',
      },
    );
  }

  async setCurrentRefresthToken(refreshToken: string, id: number) {
    const hashedToken = await hash(refreshToken, 10);

    await this.userRepository.setCurrentRefrestToken(id, hashedToken);
  }

  async refreshTokenMatches(refreshToken: string, id: number) {
    const user = await this.userRepository.findUserById(id);
    const isMatches = await compare(refreshToken, user.refreshToken);

    if (!isMatches) {
      throw new BadRequestException('refreshToken is not matched!');
    }

    return new AuthorizedUserDto(user.id, user.email);
  }

  async logIn(user: AuthorizedUserDto) {
    return await this.createToken(user);
  }

  async refreshToken(user: AuthorizedUserDto) {
    const accessToken = this.createAccessToken(user);
    return { accessToken };
  }

  async sendVerification(email: string) {
    const verifyToken = this.generateRandomNumber();
    console.log('caching data: ', email, verifyToken);
    await this.cacheManager.set(email, verifyToken);
    await this.emailService.sendVerityToken(email, verifyToken);
    return {
      sended: true,
    };
  }

  async verifyEmail(email: string, verifyToken: number) {
    const cache_verifyToken = await this.cacheManager.get(email);
    if (!cache_verifyToken) {
      throw new NotFoundException('해당 메일로 전송된 인증번호가 없습니다.');
    } else if (cache_verifyToken !== verifyToken) {
      throw new UnauthorizedException('인증번호가 일치하지 않습니다.');
    } else {
      await this.cacheManager.del(email);
      return {
        verified: true,
      };
    }
  }

  private generateRandomNumber(): number {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }
}
