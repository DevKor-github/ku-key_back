import { ExecutionContext, Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!request.headers.authorization) {
      throwKukeyException('MISSING_AUTHORIZATION_HEADER');
    }
    if (type !== 'Bearer') {
      throwKukeyException('INVALID_TOKEN_TYPE');
    }
    if (!token) {
      throwKukeyException('MISSING_TOKEN');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof TokenExpiredError) {
      throwKukeyException('ACCESS_TOKEN_EXPIRED');
    }
    if (info instanceof JsonWebTokenError) {
      throwKukeyException('INVALID_ACCESS_TOKEN');
    }
    if (!user) {
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
