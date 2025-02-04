import { CourseCategory } from 'src/enums/course-category.enum';
import { Injectable } from '@nestjs/common';
import { CourseSearchStrategy } from './course-search-strategy';
import { CourseEntity } from 'src/entities/course.entity';
import { SelectQueryBuilder } from 'typeorm';
import { SearchCourseNewDto } from '../dto/search-course-new.dto';

@Injectable()
export class AllCoursesSearchStrategy implements CourseSearchStrategy {
  supports(category: CourseCategory): boolean {
    return !category;
  }

  async buildQuery(
    queryBuilder: SelectQueryBuilder<CourseEntity>,
    searchCourseNewDto?: SearchCourseNewDto,
  ): Promise<SelectQueryBuilder<CourseEntity>> {
    return queryBuilder;
  }
}
