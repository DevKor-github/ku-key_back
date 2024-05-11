import { Injectable } from '@nestjs/common';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TimeTableCourseRepository extends Repository<TimeTableCourseEntity> {
  constructor(dataSource: DataSource) {
    super(TimeTableCourseEntity, dataSource.createEntityManager());
  }
}
