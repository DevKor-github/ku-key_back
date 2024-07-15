import { PickType } from '@nestjs/swagger';
import { SearchCourseDto } from './search-course.dto';

export class SearchCourseNameDto extends PickType(SearchCourseDto, [
  'courseName',
  'cursorId',
] as const) {}
