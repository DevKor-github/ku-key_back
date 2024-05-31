import { Module, forwardRef } from '@nestjs/common';
import { TimeTableController } from './timetable.controller';
import { TimeTableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTableEntity]),
    AuthModule,
    CourseModule,
    forwardRef(() => ScheduleModule),
  ],
  controllers: [TimeTableController],
  providers: [TimeTableService, TimeTableRepository, TimeTableCourseRepository],
  exports: [TimeTableService],
})
export class TimeTableModule {}
