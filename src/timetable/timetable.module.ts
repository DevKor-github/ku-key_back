import { Module, forwardRef } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableEntity } from 'src/entities/timetable.entity';
import { TimetableRepository } from './timetable.repository';
import { TimetableCourseRepository } from './timetable-course.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimetableEntity]),
    AuthModule,
    CourseModule,
    forwardRef(() => ScheduleModule),
  ],
  controllers: [TimetableController],
  providers: [TimetableService, TimetableRepository, TimetableCourseRepository],
  exports: [TimetableService],
})
export class TimetableModule {}
