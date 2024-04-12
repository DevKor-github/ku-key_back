import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/jwtToken.dto';
import { AuthorizedUserDto } from './dto/authorized-user-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    private readonly jwtService: JwtService,
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
    return this.jwtService.sign(user, {
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
}
