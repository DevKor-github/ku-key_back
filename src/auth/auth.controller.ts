import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth-guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';
import { AccessTokenDto } from './dto/accessToken.dto';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@User() user: AuthorizedUserDto): Promise<LoginResponseDto> {
    console.log('user : ', user);
    return await this.authService.logIn(user);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@User() user: AuthorizedUserDto): AccessTokenDto {
    console.log('user : ', user);
    return this.authService.refreshToken(user);
  }

  @Post('request-email-verification')
  async requestEmailVerification(
    @Body() body: VerificationRequestDto,
  ): Promise<VerificationResponseDto> {
    return await this.authService.requestEmailVerification(body.email);
  }

  @Post('verify-email')
  async VerifyEmailByToken(
    @Body() body: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return await this.authService.verifyEmail(body.email, body.verifyToken);
  }
}
