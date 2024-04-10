import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { CourseDetailRepository } from './course-detail.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CourseEntity,CourseDetailEntity])],
  controllers: [CourseController],
  providers: [CourseService,CourseRepository,CourseDetailRepository]
})
export class CourseModule {}
