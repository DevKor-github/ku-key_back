import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { AuthorizedUserDto } from '../dto/authorized-user-dto';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<AuthorizedUserDto> {
    const user: AuthorizedUserDto = await this.authService.validateUser(
      email,
      password,
    );

    if (!user) {
      throwKukeyException('INVALID_EMAIL');
    }

    return user;
  }
}
