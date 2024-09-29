import { ExecutionContext, Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!request.headers.authorization) {
      throwKukeyException('MISSING_AUTHORIZATION_HEADER');
    } else if (type !== 'Bearer') {
      throwKukeyException('INVALID_TOKEN_TYPE');
    } else if (!token) {
      throwKukeyException('MISSING_TOKEN');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof TokenExpiredError) {
      throwKukeyException('REFRESH_TOKEN_EXPIRED');
    } else if (info instanceof JsonWebTokenError) {
      throwKukeyException('INVALID_REFRESH_TOKEN');
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
