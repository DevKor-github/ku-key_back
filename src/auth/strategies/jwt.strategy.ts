import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthorizedUserDto } from '../dto/authorized-user-dto';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(request: Request, payload: any): Promise<AuthorizedUserDto> {
    if (payload.keepingLogin) {
      throw new BadRequestException("Don't use RefreshToken as AccessToken!");
    }
    if (request.url !== '/auth/logout') {
      const isVerified = await this.userService.checkUserVerified(payload.id);
      if (!isVerified) {
        throw new BadRequestException('user is not verified!');
      }
    }
    return new AuthorizedUserDto(payload.id, payload.username);
  }
}
