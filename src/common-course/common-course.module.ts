import { Module } from '@nestjs/common';
import { CommonCourseService } from './common-course.service';

@Module({
  providers: [CommonCourseService],
  exports: [CommonCourseService],
})
export class CommonCourseModule {}
