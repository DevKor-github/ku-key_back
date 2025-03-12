import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { CourseReviewCriteria } from 'src/enums/course-review-criteria.enum';
import { SelectQueryBuilder } from 'typeorm';

export interface CourseReviewCriteriaStrategy {
  supports(criteria: CourseReviewCriteria): boolean;

  buildQuery(
    queryBuilder: SelectQueryBuilder<CourseReviewEntity>,
  ): Promise<SelectQueryBuilder<CourseReviewEntity>>;
}
