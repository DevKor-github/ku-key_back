import { Injectable } from '@nestjs/common';
import { TimetableCourseEntity } from 'src/entities/timetable-course.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TimetableCourseRepository extends Repository<TimetableCourseEntity> {
  constructor(dataSource: DataSource) {
    super(TimetableCourseEntity, dataSource.createEntityManager());
  }
}
