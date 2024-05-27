import { Module, forwardRef } from '@nestjs/common';
import { TimeTableController } from './timetable.controller';
import { TimeTableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { CourseDetailRepository } from 'src/course/course-detail.repository';
import { CourseRepository } from 'src/course/course.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from 'src/schedule/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTableEntity]),
    AuthModule,
    forwardRef(() => ScheduleModule),
  ],
  controllers: [TimeTableController],
  providers: [
    TimeTableService,
    TimeTableRepository,
    TimeTableCourseRepository,
    CourseDetailRepository,
    CourseRepository,
  ],
  exports: [TimeTableRepository],
})
export class TimeTableModule {}
