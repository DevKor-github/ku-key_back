import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { CommentLikeEntity } from 'src/entities/comment-like.entity';
import { CommentAnonymousNumberEntity } from 'src/entities/comment-anonymous-number.entity';
import { NoticeModule } from 'src/notice/notice.module';
import { ReportModule } from '../report/report.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      CommentLikeEntity,
      CommentAnonymousNumberEntity,
    ]),
    PostModule,
    NoticeModule,
    ReportModule,
    UserModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
