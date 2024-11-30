import { PickType } from '@nestjs/swagger';
import { GetCourseDto } from './get-course.dto';

export class GetMajorCourseDto extends PickType(GetCourseDto, [
  'major',
  'cursorId',
  'year',
  'semester',
] as const) {}
