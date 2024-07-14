import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { CommentLikeEntity } from 'src/entities/comment-like.entity';
import { CommentAnonymousNumberEntity } from 'src/entities/comment-anonymous-number.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      CommentLikeEntity,
      CommentAnonymousNumberEntity,
    ]),
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
