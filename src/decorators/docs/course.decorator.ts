import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CourseController } from 'src/course/course.controller';
import { PaginatedCoursesDto } from 'src/course/dto/paginated-courses.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';
import { CourseCategory } from 'src/enums/course-category.enum';
import { CommonCourseResponseDto } from 'src/course/dto/common-course-response.dto';

type CourseEndPoints = MethodNames<CourseController>;

const CourseDocsMap: Record<CourseEndPoints, MethodDecorator[]> = {
  searchCourses: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '강의 검색',
      description: '하나의 엔드포인트로 모든 강의검색 로직을 통합했습니다.',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'semester',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      type: 'enum',
      enum: CourseCategory,
    }),
    ApiQuery({
      name: 'keyword',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'classification',
      required: false,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: '강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
    ApiKukeyExceptionResponse(['MAJOR_REQUIRED', 'COLLEGE_REQUIRED']),
  ],
  getRecommendationCourses: [
    ApiOperation({
      summary: '추천 강의 조회',
      description: '추천 강의를 조회합니다.',
    }),
    ApiQuery({
      name: 'limit',
      required: true,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '추천 강의 조회 성공 시',
      type: [CommonCourseResponseDto],
    }),
  ],
};

export function CourseDocs(target: typeof CourseController) {
  for (const key in CourseDocsMap) {
    const methodDecorators = CourseDocsMap[key as keyof typeof CourseDocsMap];

    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (descriptor) {
      for (const decorator of methodDecorators) {
        decorator(target.prototype, key, descriptor);
      }
      Object.defineProperty(target.prototype, key, descriptor);
    }
  }
  return target;
}
