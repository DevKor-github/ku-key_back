import { UserRepository } from './../../user/user.repository';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { throwKukeyException } from 'src/utils/exception.util';

export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<string>(ROLES_KEY, context.getHandler());
    if (!role) {
      // 적용된 role guard 없을 경우 true
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // user 정보 없는 경우 false
      throwKukeyException('LOGIN_REQUIRED');
    }

    const userRole = await this.userRepository.findOne({
      where: { id: user.id },
    });

    // 데코레이터에서 가져온 role과 userRole이 동일한지
    if (!role.includes(userRole.role)) {
      throwKukeyException('ADMIN_ONLY_ACCESSIBLE');
    }
    return true;
  }
}
