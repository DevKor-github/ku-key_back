import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';
import { timeTableCourseRepository } from './timetable-course.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTableEntity])],
  controllers: [TimetableController],
  providers: [TimetableService,TimeTableRepository,timeTableCourseRepository]
})
export class TimetableModule {}
