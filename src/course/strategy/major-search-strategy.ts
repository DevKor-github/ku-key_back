import { Injectable } from '@nestjs/common';
import { CourseCategory } from 'src/enums/course-category.enum';
import { CourseSearchStrategy } from './course-search-strategy';
import { SearchCourseNewDto } from '../dto/search-course-new.dto';
import { throwKukeyException } from 'src/utils/exception.util';
import { SelectQueryBuilder } from 'typeorm';
import { CourseEntity } from 'src/entities/course.entity';

@Injectable()
export class MajorSearchStrategy implements CourseSearchStrategy {
  supports(category: CourseCategory): boolean {
    return category === CourseCategory.MAJOR;
  }

  async buildQuery(
    queryBuilder: SelectQueryBuilder<CourseEntity>,
    searchCourseNewDto: SearchCourseNewDto,
  ): Promise<SelectQueryBuilder<CourseEntity>> {
    if (!searchCourseNewDto.classification) {
      throwKukeyException('MAJOR_REQUIRED');
    }

    const { classification } = searchCourseNewDto;

    return queryBuilder
      .andWhere('course.category = :category', {
        category: CourseCategory.MAJOR,
      })
      .andWhere('course.major = :major', { major: classification });
  }
}
