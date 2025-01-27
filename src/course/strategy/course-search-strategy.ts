import { CourseCategory } from 'src/enums/course-category.enum';
import { PaginatedCoursesDto } from '../dto/paginated-courses.dto';
import { SearchCourseNewDto } from '../dto/search-course-new.dto';

export interface CourseSearchStrategy {
  supports(category: CourseCategory): boolean;

  search(searchCourseNewDto: SearchCourseNewDto): Promise<PaginatedCoursesDto>;
}
