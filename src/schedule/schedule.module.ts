import { Module, forwardRef } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleRepository } from './schedule.repository';
import { TimeTableModule } from 'src/timetable/timetable.module';
import { TimeTableCourseRepository } from 'src/timetable/timetable-course.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleEntity]),
    AuthModule,
    forwardRef(() => TimeTableModule),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository, TimeTableCourseRepository],
  exports: [ScheduleService],
})
export class ScheduleModule {}
