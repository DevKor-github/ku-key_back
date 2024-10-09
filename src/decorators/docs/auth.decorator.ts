import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthController } from 'src/auth/auth.controller';
import { ChangePasswordRequestDto } from 'src/auth/dto/change-password-request.dto';
import { ChangePasswordResponseDto } from 'src/auth/dto/change-password-response.dto';
import { GetScreenshotVerificationsResponseDto } from 'src/auth/dto/get-screenshot-verifications-request.dto';
import { JwtTokenDto } from 'src/auth/dto/jwtToken.dto';
import { LoginRequestDto } from 'src/auth/dto/login-request.dto';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { LogoutResponseDto } from 'src/auth/dto/logout-response.dto';
import { PasswordDto } from 'src/auth/dto/password.dto';
import {
  SendTempPasswordRequestDto,
  SendTempPasswordResponseDto,
} from 'src/auth/dto/send-temporary-password.dto';
import { SignUpRequestDto } from 'src/auth/dto/sign-up-request.dto';
import { SignUpResponseDto } from 'src/auth/dto/sign-up-response.dto';
import { VerificationRequestDto } from 'src/auth/dto/verification-request.dto';
import { VerificationResponseDto } from 'src/auth/dto/verification-response.dto';
import { VerifyEmailRequestDto } from 'src/auth/dto/verify-email-request.dto';
import { VerifyEmailResponseDto } from 'src/auth/dto/verify-email-response.dto';
import { VerifyScreenshotRequestDto } from 'src/auth/dto/verify-screenshot-request.dto';
import { VerifyScreenshotResponseDto } from 'src/auth/dto/verify-screenshot-response.dto';
import { MethodNames } from 'src/common/types/method';
import { checkPossibleResponseDto } from 'src/user/dto/check-possible-response.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type AuthEndPoints = MethodNames<AuthController>;

const AuthDocsMap: Record<AuthEndPoints, MethodDecorator[]> = {
  logIn: [
    ApiOperation({
      summary: '로그인',
      description: `로그인하여 JWT Token을 발급받습니다.
        Access Token의 만료기간은 5분이고 Refresh Token의 만료기간은 로그인 유지가 참일 경우 14일, 아닐 경우 2일입니다.`,
    }),
    ApiBody({
      type: LoginRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '로그인 성공',
      type: LoginResponseDto,
    }),
    ApiKukeyExceptionResponse(['REFRESH_TOKEN_UPDATE_FAILED']),
  ],
  refreshToken: [
    ApiBearerAuth('refreshToken'),
    ApiOperation({
      summary: 'Token 재발급',
      description:
        'Refresh Token을 사용하여 Access Token과 Refresh Token을 재발급받습니다.',
    }),
    ApiResponse({
      status: 201,
      description: 'Token 재발급 성공',
      type: JwtTokenDto,
    }),
    ApiKukeyExceptionResponse(['REFRESH_TOKEN_UPDATE_FAILED']),
  ],
  logOut: [
    ApiOperation({
      summary: '로그아웃',
      description: '서버에 저장된 Refresh Token을 삭제합니다.',
    }),
    ApiBearerAuth('accessToken'),
    ApiResponse({
      status: 201,
      description: '로그아웃 성공',
      type: LogoutResponseDto,
    }),
  ],
  requestEmailVerification: [
    ApiOperation({
      summary: '이메일 인증번호 발송',
      description: '이메일로 인증번호를 발송합니다.',
    }),
    ApiBody({
      type: VerificationRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '이메일 발송 성공',
      type: VerificationResponseDto,
    }),
  ],
  VerifyEmailByToken: [
    ApiOperation({
      summary: '이메일 인증',
      description: '발송된 인증번호로 이메일을 인증합니다.',
    }),
    ApiBody({
      type: VerifyEmailRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '이메일 인증 성공',
      type: VerifyEmailResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'VERIFY_TOKEN_NOT_FOUND',
      'INVALID_VERIFY_TOKEN',
    ]),
  ],
  createUserandScreenshotRequest: [
    ApiOperation({
      summary: '회원가입 및 학교인증 요청',
      description: '유저정보를 생성하고 학교인증 요청을 발송합니다.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: SignUpRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '회원가입 및 학교인증 요청 성공',
      type: SignUpResponseDto,
    }),
    ApiKukeyExceptionResponse(['NOT_IMAGE_FILE']),
  ],
  getScreenshotVerifyRequests: [
    ApiOperation({
      summary: '학교인증 요청 목록 조회',
      description: '승인 대기 중인 학교 인증 요청 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 201,
      description: '학교인증 요청 조회 성공',
      type: [GetScreenshotVerificationsResponseDto],
    }),
  ],
  verifyScreenshotReqeust: [
    ApiOperation({
      summary: '학교인증 요청 승인/거절',
      description: '학교 인증 요청을 승인 혹은 거절합니다.',
    }),
    ApiBody({
      type: VerifyScreenshotRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '학교인증 요청 조회 성공',
      type: VerifyScreenshotResponseDto,
    }),
    ApiKukeyExceptionResponse(['USER_VERIFICATION_FAILED']),
  ],
  checkStudentNumberPossible: [
    ApiOperation({
      summary: '학번 중복 확인',
      description: '요청한 학번으로 인증된 유저가 있는지 확인합니다.',
    }),
    ApiParam({
      name: 'studentNumber',
      description: '중복확인하고자 하는 학번',
    }),
    ApiResponse({
      status: 200,
      description: '학번 사용 가능 (중복된 학번 없음)',
      type: checkPossibleResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: '학번 사용 불가능 (중복된 학번 있음)',
      type: checkPossibleResponseDto,
    }),
  ],
  checkUsernamePossible: [
    ApiOperation({
      summary: 'username 중복 확인',
      description: '요청한 username을 사용하는 유저가 있는지 확인합니다.',
    }),
    ApiParam({
      name: 'username',
      description: '중복확인하고자 하는 username',
    }),
    ApiResponse({
      status: 200,
      description: 'username 사용 가능 (중복된 username 없음)',
      type: checkPossibleResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'username 사용 불가능 (중복된 username 있음)',
      type: checkPossibleResponseDto,
    }),
  ],
  checkEmailPossible: [
    ApiOperation({
      summary: 'email 중복 확인',
      description: '요청한 email을 사용하는 유저가 있는지 확인합니다.',
    }),
    ApiParam({
      name: 'email',
      description: '중복확인하고자 하는 email',
    }),
    ApiResponse({
      status: 200,
      description: 'email 사용 가능 (중복된 email 없음)',
      type: checkPossibleResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'email 사용 불가능 (중복된 email 있음)',
      type: checkPossibleResponseDto,
    }),
    ApiKukeyExceptionResponse(['RE_REGISTRATION_NOT_ALLOWED']),
  ],
  updatePassword: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '비밀번호 변경',
      description: '사용자의 비밀번호를 변경합니다.',
    }),
    ApiBody({
      type: ChangePasswordRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '비밀번호 변경 성공',
      type: ChangePasswordResponseDto,
    }),
    ApiKukeyExceptionResponse(['SAME_PASSWORD', 'PASSWORD_UPDATE_FAILED']),
  ],
  sendTemporaryPassword: [
    ApiOperation({
      summary: '임시비밀번호 발급',
      description: '임시비밀번호를 발급하여 이메일로 발송합니다.',
    }),
    ApiBody({
      type: SendTempPasswordRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '임시비밀번호 발급 성공',
      type: SendTempPasswordResponseDto,
    }),
    ApiKukeyExceptionResponse(['PASSWORD_UPDATE_FAILED']),
  ],
  checkPasswordMatch: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '비밀번호 확인',
      description: '저장된 비밀번호가 맞는지 확인합니다.',
    }),
    ApiBody({
      type: PasswordDto,
    }),
    ApiResponse({
      description: '비밀번호 일치 여부',
      type: Boolean,
    }),
  ],
  checkVerified: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '인증 여부 확인',
      description: '유저가 인증이 되었는지 확인합니다.',
    }),
    ApiResponse({
      description: '인증 여부',
      type: Boolean,
    }),
  ],
};

export function AuthDocs(target: typeof AuthController) {
  for (const key in AuthDocsMap) {
    const methodDecorators = AuthDocsMap[key as keyof typeof AuthDocsMap];

    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (descriptor) {
      for (const decorator of methodDecorators) {
        decorator(target.prototype, key, descriptor);
      }
      Object.defineProperty(target.prototype, key, descriptor);
    }
  }
  return target;
}
