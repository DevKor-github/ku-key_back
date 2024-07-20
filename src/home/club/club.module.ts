import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from 'src/entities/club.entity';
import { ClubRepository } from './club.repository';
import { ClubLikeRepository } from './club-like.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity])],
  providers: [ClubService, ClubRepository, ClubLikeRepository],
  controllers: [ClubController],
})
export class ClubModule {}
