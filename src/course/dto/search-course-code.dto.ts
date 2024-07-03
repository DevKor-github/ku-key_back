import { PickType } from '@nestjs/swagger';
import { SearchCourseDto } from './search-course.dto';

export class SearchCourseCodeDto extends PickType(SearchCourseDto, [
  'courseCode',
] as const) {}
