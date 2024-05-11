import { Module } from '@nestjs/common';
import { TimeTableController } from './timetable.controller';
import { TimeTableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { CourseDetailRepository } from 'src/course/course-detail.repository';
import { CourseRepository } from 'src/course/course.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTableEntity])],
  controllers: [TimeTableController],
  providers: [
    TimeTableService,
    TimeTableRepository,
    TimeTableCourseRepository,
    CourseDetailRepository,
    CourseRepository,
  ],
})
export class TimeTableModule {}
