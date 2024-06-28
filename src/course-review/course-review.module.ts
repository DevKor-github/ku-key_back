import { Module } from '@nestjs/common';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './course-review.service';

@Module({
  controllers: [CourseReviewController],
  providers: [CourseReviewService]
})
export class CourseReviewModule {}
