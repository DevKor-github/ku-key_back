import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth-guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@User() user: AuthorizedUserDto) {
    console.log('user : ', user);
    return await this.authService.logIn(user);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@User() user: AuthorizedUserDto) {
    console.log('user : ', user);
    return await this.authService.refreshToken(user);
  }

  @Post('verification-request')
  async sendVerification(@Body() body: VerificationRequestDto) {
    return await this.authService.sendVerification(body.email);
  }

  @Post('verify-email')
  async VerifyEmailByToken(@Body() body: VerifyEmailRequestDto) {
    return await this.authService.verifyEmail(body.email, body.verifyToken);
  }
}
