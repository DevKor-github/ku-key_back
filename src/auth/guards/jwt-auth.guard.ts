import { Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof TokenExpiredError) {
      throwKukeyException('ACCESS_TOKEN_EXPIRED');
    } else if (info instanceof JsonWebTokenError) {
      throwKukeyException('INVALID_ACCESS_TOKEN');
    } else if (!user) {
      // validate 함수의 반환값이 없는 경우
      if (err) {
        // 에러가 있다면 그대로 던짐
        throw err;
      } else {
        throwKukeyException('LOGIN_REQUIRED');
      }
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
