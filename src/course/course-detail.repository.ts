import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';

@Injectable()
export class CourseDetailRepository extends Repository<CourseDetailEntity> {
  constructor(dataSource: DataSource) {
    super(CourseDetailEntity, dataSource.createEntityManager());
  }
}
