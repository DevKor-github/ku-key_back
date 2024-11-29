import { PickType } from '@nestjs/swagger';
import { SearchCourseDto } from './search-course.dto';

export class SearchCoursesWithKeywordDto extends PickType(SearchCourseDto, [
  'keyword',
  'cursorId',
  'year',
  'semester',
] as const) {}
