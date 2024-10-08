import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthorizedUserDto } from '../dto/authorized-user-dto';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { throwKukeyException } from 'src/utils/exception.util';

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
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(
    request: Request,
    payload: AuthorizedUserDto,
  ): Promise<AuthorizedUserDto> {
    const passingUrls = ['/auth/logout', '/auth/password'];
    if (!passingUrls.includes(request.url)) {
      const isVerified = await this.userService.checkUserVerified(payload.id);
      if (!isVerified) {
        throwKukeyException('USER_NOT_VERIFIED');
      }
    }
    return payload;
  }
}
