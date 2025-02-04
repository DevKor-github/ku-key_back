import { CourseCategory } from 'src/enums/course-category.enum';
import { SearchCourseNewDto } from '../dto/search-course-new.dto';
import { SelectQueryBuilder } from 'typeorm';
import { CourseEntity } from 'src/entities/course.entity';

export interface CourseSearchStrategy {
  supports(category: CourseCategory): boolean;

  buildQuery(
    queryBuilder: SelectQueryBuilder<CourseEntity>,
    searchCourseNewDto?: SearchCourseNewDto,
  ): Promise<SelectQueryBuilder<CourseEntity>>;
}
