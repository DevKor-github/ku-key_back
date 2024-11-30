import { PickType } from '@nestjs/swagger';
import { GetCourseDto } from './get-course.dto';

export class GetGeneralCourseDto extends PickType(GetCourseDto, [
  'cursorId',
  'year',
  'semester',
] as const) {}
