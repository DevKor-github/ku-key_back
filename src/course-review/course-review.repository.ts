import { Injectable } from '@nestjs/common';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CourseReviewRepository extends Repository<CourseReviewEntity> {
  constructor(dataSource: DataSource) {
    super(CourseReviewEntity, dataSource.createEntityManager());
  }
}
