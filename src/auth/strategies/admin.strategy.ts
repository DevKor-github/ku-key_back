import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'id',
      passwordField: 'password',
    });
  }

  async validate(id: string, password: string): Promise<boolean> {
    const isAdmin = this.authService.validateAdmin(id, password);
    console.log(isAdmin);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }

    return isAdmin;
  }
}
