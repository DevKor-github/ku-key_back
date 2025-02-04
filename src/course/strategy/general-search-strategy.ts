import { CourseCategory } from 'src/enums/course-category.enum';
import { Injectable } from '@nestjs/common';
import { CourseSearchStrategy } from './course-search-strategy';
import { SelectQueryBuilder } from 'typeorm';
import { CourseEntity } from 'src/entities/course.entity';

@Injectable()
export class GeneralSearchStrategy implements CourseSearchStrategy {
  supports(category: CourseCategory): boolean {
    return category === CourseCategory.GENERAL_STUDIES;
  }

  async buildQuery(
    queryBuilder: SelectQueryBuilder<CourseEntity>,
  ): Promise<SelectQueryBuilder<CourseEntity>> {
    return queryBuilder.andWhere('course.category = :category', {
      category: CourseCategory.GENERAL_STUDIES,
    });
  }
}
