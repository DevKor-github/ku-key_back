import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { CharacterEntity } from 'src/entities/character.entity';
import { PointService } from './point.service';
import { UserLanguageEntity } from 'src/entities/user-language.entity';
import { UserBanEntity } from 'src/entities/user-ban.entity';
import { NoticeModule } from 'src/notice/notice.module';
import { UserBanService } from 'src/user/user-ban.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PointHistoryEntity,
      CharacterEntity,
      UserLanguageEntity,
      UserBanEntity,
    ]),
    NoticeModule,
  ],
  controllers: [UserController],
  providers: [UserService, PointService, UserRepository, UserBanService],
  exports: [UserService, PointService, UserRepository, UserBanService],
})
export class UserModule {}
