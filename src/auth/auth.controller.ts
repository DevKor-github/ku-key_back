import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth-guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
('./guards/jwt-auth.guard');
import { VerifyScreenshotRequestDto } from './dto/verify-screenshot-request.dto';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';
import { checkPossibleResponseDto } from 'src/user/dto/check-possible-response.dto';
import { Response } from 'express';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { UserService } from 'src/user/user.service';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginRequestDto } from './dto/login-request.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import {
  SendTempPasswordRequestDto,
  SendTempPasswordResponseDto,
} from './dto/send-temporary-password.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtTokenDto } from './dto/jwtToken.dto';
import { RolesGuard } from './guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { PasswordDto } from './dto/password.dto';
import { UnhandledExceptionFilter } from 'src/common/filter/unhandled-exception.filter';
import { KukeyExceptionFilter } from 'src/common/filter/kukey-exception.filter';

@ApiTags('Auth')
@Controller('auth')
@UseFilters(UnhandledExceptionFilter, KukeyExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: '로그인',
    description: `로그인하여 JWT Token을 발급받습니다.
      Access Token의 만료기간은 5분이고 Refresh Token의 만료기간은 로그인 유지가 참일 경우 14일, 아닐 경우 2일입니다.`,
  })
  @ApiBody({
    type: LoginRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @Post('login')
  async logIn(
    @User() user: AuthorizedUserDto,
    @Body() body: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const keepingLogin = body.keepingLogin;
    return await this.authService.logIn(user, keepingLogin);
  }

  @UseGuards(RefreshAuthGuard)
  @ApiOperation({
    summary: 'Token 재발급',
    description:
      'Refresh Token을 사용하여 Access Token과 Refresh Token을 재발급받습니다.',
  })
  @ApiBearerAuth('refreshToken')
  @ApiResponse({
    status: 201,
    description: 'Token 재발급 성공',
    type: JwtTokenDto,
  })
  @Post('refresh')
  async refreshToken(@User() user: AuthorizedUserDto): Promise<JwtTokenDto> {
    return await this.authService.refreshToken(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '로그아웃',
    description: '서버에 저장된 Refresh Token을 삭제합니다.',
  })
  @ApiBearerAuth('accessToken')
  @ApiResponse({
    status: 201,
    description: '로그아웃 성공',
    type: LogoutResponseDto,
  })
  @Post('logout')
  async logOut(@User() user: AuthorizedUserDto): Promise<LogoutResponseDto> {
    return await this.authService.logout(user);
  }

  @ApiOperation({
    summary: '이메일 인증번호 발송',
    description: '이메일로 인증번호를 발송합니다.',
  })
  @ApiBody({
    type: VerificationRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '이메일 발송 성공',
    type: VerificationResponseDto,
  })
  @Post('request-email-verification')
  async requestEmailVerification(
    @Body() body: VerificationRequestDto,
  ): Promise<VerificationResponseDto> {
    return await this.authService.requestEmailVerification(body.email);
  }

  @ApiOperation({
    summary: '이메일 인증',
    description: '발송된 인증번호로 이메일을 인증합니다.',
  })
  @ApiBody({
    type: VerifyEmailRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '이메일 인증 성공',
    type: VerifyEmailResponseDto,
  })
  @Post('verify-email')
  async VerifyEmailByToken(
    @Body() body: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return await this.authService.verifyEmail(body.email, body.verifyToken);
  }

  @ApiOperation({
    summary: '회원가입 및 학교인증 요청',
    description: '유저정보를 생성하고 학교인증 요청을 발송합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SignUpRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 및 학교인증 요청 성공',
    type: SignUpResponseDto,
  })
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('screenshot'), TransactionInterceptor)
  async createUserandScreenshotRequest(
    @TransactionManager() transactionManager: EntityManager,
    @UploadedFile() screenshot: Express.Multer.File,
    @Body() body: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    if (!screenshot) {
      throw new BadRequestException('screenshot should be uploaded');
    }
    return await this.authService.createUserandScreenshotRequest(
      transactionManager,
      screenshot,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    summary: '학교인증 요청 목록 조회',
    description: '승인 대기 중인 학교 인증 요청 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '학교인증 요청 조회 성공',
    type: [GetScreenshotVerificationsResponseDto],
  })
  @Get('admin/request')
  async getScreenshotVerifyRequests(): Promise<
    GetScreenshotVerificationsResponseDto[]
  > {
    return this.authService.getScreenshotVerifyRequests();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    summary: '학교인증 요청 승인/거절',
    description: '학교 인증 요청을 승인 혹은 거절합니다.',
  })
  @ApiBody({
    type: VerifyScreenshotRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '학교인증 요청 조회 성공',
    type: VerifyScreenshotResponseDto,
  })
  @Post('admin/request/:id')
  async verifyScreenshotReqeust(
    @Param('id') id: number,
    @Body() body: VerifyScreenshotRequestDto,
  ): Promise<VerifyScreenshotResponseDto> {
    return await this.authService.verifyScreenshotReqeust(id, body.verify);
  }

  @ApiOperation({
    summary: '학번 중복 확인',
    description: '요청한 학번으로 인증된 유저가 있는지 확인합니다.',
  })
  @ApiParam({
    name: 'studentNumber',
    description: '중복확인하고자 하는 학번',
  })
  @ApiResponse({
    status: 200,
    description: '학번 사용 가능 (중복된 학번 없음)',
    type: checkPossibleResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: '학번 사용 불가능 (중복된 학번 있음)',
    type: checkPossibleResponseDto,
  })
  @Post('student-number/:studentNumber')
  async checkStudentNumberPossible(
    @Param('studentNumber') studentNumber: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto =
      await this.authService.checkStudentNumberPossible(studentNumber);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @ApiOperation({
    summary: 'username 중복 확인',
    description: '요청한 username을 사용하는 유저가 있는지 확인합니다.',
  })
  @ApiParam({
    name: 'username',
    description: '중복확인하고자 하는 username',
  })
  @ApiResponse({
    status: 200,
    description: 'username 사용 가능 (중복된 username 없음)',
    type: checkPossibleResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'username 사용 불가능 (중복된 username 있음)',
    type: checkPossibleResponseDto,
  })
  @Post('username/:username')
  async checkUsernamePossible(
    @Param('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkUsernamePossible(username);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @ApiOperation({
    summary: 'email 중복 확인',
    description: '요청한 email을 사용하는 유저가 있는지 확인합니다.',
  })
  @ApiParam({
    name: 'email',
    description: '중복확인하고자 하는 email',
  })
  @ApiResponse({
    status: 200,
    description: 'email 사용 가능 (중복된 email 없음)',
    type: checkPossibleResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'email 사용 불가능 (중복된 email 있음)',
    type: checkPossibleResponseDto,
  })
  @Post('email/:email')
  async checkEmailPossible(
    @Param('email') email: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkEmailPossible(email);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @ApiOperation({
    summary: '비밀번호 변경',
    description: '사용자의 비밀번호를 변경합니다.',
  })
  @ApiBearerAuth('accessToken')
  @ApiBody({
    type: ChangePasswordRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
    type: ChangePasswordResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @User() user: AuthorizedUserDto,
    @Body() body: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    return await this.authService.updatePassword(user.id, body.newPassword);
  }

  @ApiOperation({
    summary: '임시비밀번호 발급',
    description: '임시비밀번호를 발급하여 이메일로 발송합니다.',
  })
  @ApiBody({
    type: SendTempPasswordRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '임시비밀번호 발급 성공',
    type: SendTempPasswordResponseDto,
  })
  @Post('temporary-password')
  async sendTemporaryPassword(
    @Body() body: SendTempPasswordRequestDto,
  ): Promise<SendTempPasswordResponseDto> {
    return await this.authService.sendTemporaryPassword(body.email);
  }

  @ApiOperation({
    summary: '비밀번호 확인',
    description: '저장된 비밀번호가 맞는지 확인합니다.',
  })
  @ApiBody({
    type: PasswordDto,
  })
  @ApiResponse({
    description: '비밀번호 일치 여부',
    type: Boolean,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @Post('password')
  async checkPasswordMatch(
    @User() user: AuthorizedUserDto,
    @Body() body: PasswordDto,
  ): Promise<boolean> {
    return await this.userService.isPasswordMatched(user.id, body.password);
  }

  @ApiOperation({
    summary: '인증 여부 확인',
    description: '유저가 인증이 되었는지 확인합니다.',
  })
  @ApiResponse({
    description: '인증 여부',
    type: Boolean,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @Get('is-verified')
  async checkVerified(): Promise<boolean> {
    return true;
  }
}
