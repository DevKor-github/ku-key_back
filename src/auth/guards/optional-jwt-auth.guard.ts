import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    // user가 존재한다면 그대로, 비로그인 or 미인증 유저의 경우 null 반환
    return user || null;
  }
  // jwt 인증 실패해도 guard 통과 시킴
  async canActivate(context: ExecutionContext) {
    await super.canActivate(context);
    return true;
  }
}
