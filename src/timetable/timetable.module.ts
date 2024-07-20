import { Module, forwardRef } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableEntity } from 'src/entities/timetable.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { CourseModule } from 'src/course/course.module';
import { TimetableCourseEntity } from 'src/entities/timetable-course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimetableEntity, TimetableCourseEntity]),
    AuthModule,
    CourseModule,
    forwardRef(() => ScheduleModule),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
