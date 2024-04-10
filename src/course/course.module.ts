import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';

@Module({
  controllers: [CourseController],
  providers: [CourseService,CourseRepository]
})
export class CourseModule {}
