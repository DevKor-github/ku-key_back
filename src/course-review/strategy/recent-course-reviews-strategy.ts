import { Injectable } from '@nestjs/common';
import { CourseReviewCriteriaStrategy } from './course-review-criteria-strategy';
import { CourseReviewCriteria } from 'src/enums/course-review-criteria.enum';
import { SelectQueryBuilder } from 'typeorm';
import { CourseReviewEntity } from 'src/entities/course-review.entity';

@Injectable()
export class RecentCourseReviewsStrategy
  implements CourseReviewCriteriaStrategy
{
  supports(criteria: CourseReviewCriteria): boolean {
    return criteria === CourseReviewCriteria.RECENT;
  }

  async buildQuery(
    queryBuilder: SelectQueryBuilder<CourseReviewEntity>,
  ): Promise<SelectQueryBuilder<CourseReviewEntity>> {
    return queryBuilder
      .addSelect('MAX(courseReview.createdAt)', 'maxCreatedAt')
      .orderBy('maxCreatedAt', 'DESC');
  }
}
