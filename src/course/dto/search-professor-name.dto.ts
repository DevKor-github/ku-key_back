import { PickType } from '@nestjs/swagger';
import { SearchCourseDto } from './search-course.dto';

export class SearchProfessorNameDto extends PickType(SearchCourseDto, [
  'professorName',
  'cursorId',
  'year',
  'semester',
] as const) {}
