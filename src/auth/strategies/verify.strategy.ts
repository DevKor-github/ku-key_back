import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthorizedUserDto } from '../dto/authorized-user-dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class VerifyStrategy extends PassportStrategy(Strategy, 'verify') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<AuthorizedUserDto> {
    const isVerified = await this.userService.checkUserVerified(payload.id);
    if (isVerified) {
      throw new BadRequestException('user is already verified!');
    }
    return new AuthorizedUserDto(payload.id, payload.username);
  }
}
