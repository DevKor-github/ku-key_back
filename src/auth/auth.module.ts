import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from 'src/user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { EmailService } from './email.service';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';
import { VerifyStrategy } from './strategies/verify.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KuVerificationEntity } from 'src/entities/ku-verification.entity';
import { KuVerificationRepository } from './ku-verification.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '30m' },
        };
      },
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    TypeOrmModule.forFeature([KuVerificationEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    UserRepository,
    KuVerificationRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    VerifyStrategy,
  ],
})
export class AuthModule {}
