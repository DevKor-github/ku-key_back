import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostImageRepository } from './post-image.repository';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { BoardModule } from '../board/board.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, PostImageEntity]),
    BoardModule,
    CommonModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, PostImageRepository],
  exports: [PostService],
})
export class PostModule {}
