import { Injectable } from '@nestjs/common';
import { CourseEntity } from 'src/entities/course.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CourseRepository extends Repository<CourseEntity> {
  constructor(dataSource: DataSource) {
    super(CourseEntity, dataSource.createEntityManager());
  }
}
