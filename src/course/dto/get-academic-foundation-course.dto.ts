import { PickType } from '@nestjs/swagger';
import { GetCourseDto } from './get-course.dto';

export class GetAcademicFoundationCourseDto extends PickType(GetCourseDto, [
  'college',
  'cursorId',
  'year',
  'semester',
] as const) {}
