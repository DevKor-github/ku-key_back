import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from 'src/entities/report.entity';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportController } from './report.controller';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/community/post/post.module';
import { CommentModule } from 'src/community/comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity]),
    CommonModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
  exports: [ReportService],
})
export class ReportModule {}
