import { Module } from '@nestjs/common';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './course-review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CourseReviewRepository } from './course-review.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity]), AuthModule],
  controllers: [CourseReviewController],
  providers: [CourseReviewService, CourseReviewRepository],
})
export class CourseReviewModule {}
