import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KuVerificationEntity } from 'src/entities/ku-verification.entity';
import { KuVerificationRepository } from './ku-verification.repository';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from 'src/common/common.module';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([KuVerificationEntity]),
    UserModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KuVerificationRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    OptionalJwtAuthGuard,
  ],
})
export class AuthModule {}
