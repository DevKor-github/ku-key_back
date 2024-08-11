import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { CharacterEntity } from 'src/entities/character.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PointHistoryEntity, CharacterEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
