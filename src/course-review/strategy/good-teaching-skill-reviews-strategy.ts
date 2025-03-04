import { Injectable } from '@nestjs/common';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { CourseReviewCriteria } from 'src/enums/course-review-criteria.enum';
import { SelectQueryBuilder } from 'typeorm';
import { CourseReviewCriteriaStrategy } from './course-review-criteria-strategy';

@Injectable()
export class GoodTeachingSkillReviewsStrategy
  implements CourseReviewCriteriaStrategy
{
  supports(criteria: CourseReviewCriteria): boolean {
    return criteria === CourseReviewCriteria.TEACHING;
  }

  async buildQuery(
    queryBuilder: SelectQueryBuilder<CourseReviewEntity>,
  ): Promise<SelectQueryBuilder<CourseReviewEntity>> {
    return queryBuilder
      .addSelect('AVG(courseReview.teachingSkills)', 'avgTeachingSkills')
      .having('avgTeachingSkills >= :minTeachingSkill', {
        minTeachingSkill: 4,
      })
      .orderBy('avgTeachingSkills', 'DESC');
  }
}
