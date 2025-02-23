import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CourseReviewController } from 'src/course-review/course-review.controller';
import { CourseReviewResponseDto } from 'src/course-review/dto/course-review-response.dto';
import { CreateCourseReviewRequestDto } from 'src/course-review/dto/create-course-review-request.dto';
import { GetCourseReviewSummaryResponseDto } from 'src/course-review/dto/get-course-review-summary-response.dto';
import { GetCourseReviewsResponseDto } from 'src/course-review/dto/get-course-reviews-response.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';
import { PaginatedCourseReviewsDto } from 'src/course-review/dto/paginated-course-reviews.dto';
import { GetCoursesWithRecentCourseReviewsResponseDto } from 'src/course-review/dto/get-courses-with-recent-course-reviews-response.dto';

type CourseReviewEndPoints = MethodNames<CourseReviewController>;

const CourseReviewDocsMap: Record<CourseReviewEndPoints, MethodDecorator[]> = {
  createCourseReview: [
    ApiOperation({
      summary: '강의평 추가',
      description:
        '강의평을 추가합니다. 유저가 해당 강의에 대해 이미 강의평을 등록했으면 더 이상 등록되지 않습니다.',
    }),
    ApiBody({
      type: CreateCourseReviewRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '강의평 등록 성공',
      type: CourseReviewResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COURSE_NOT_FOUND',
      'COURSE_REVIEW_ALREADY_EXIST',
      'USER_NOT_FOUND',
    ]),
  ],
  getCourseReviewSummary: [
    ApiOperation({
      summary: '강의평 요약 조회',
      description:
        '해당 교수의 해당 강의에 대한 강의평들을 종합한 강의평 요약을 조회합니다.',
    }),
    ApiQuery({
      name: 'courseCode',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'professorName',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '종합 강의평 조회 성공',
      type: GetCourseReviewSummaryResponseDto,
    }),
    ApiKukeyExceptionResponse(['COURSE_NOT_FOUND']),
  ],
  getMyCourseReviews: [
    ApiOperation({
      summary: '내 강의평 조회',
      description: '내가 작성한 강의평을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '내 강의평 조회 성공',
      type: CourseReviewResponseDto,
      isArray: true,
    }),
  ],
  checkCourseReviewSubmission: [
    ApiOperation({
      summary: '이미 해당 강의에 대해 강의평 작성했는 지 조회',
      description:
        '해당 강의에 대해 이미 강의평을 작성했으면 true, 아니면 false 반환',
    }),
    ApiResponse({
      status: 200,
      description: '강의평 작성 여부 조회 성공',
      type: Boolean,
    }),
  ],
  getCourseReviewsWithKeyword: [
    ApiOperation({
      summary: '강의평 검색',
      description: '키워드로 강의평을 검색합니다.',
    }),
    ApiQuery({
      name: 'keyword',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: '강의평 검색 성공',
      type: PaginatedCourseReviewsDto,
    }),
  ],
  getCourseReviews: [
    ApiOperation({
      summary: '강의평 조회',
      description:
        '해당 교수의 해당 강의에 대해 강의평을 조회합니다. 열람권이 없으면 열람할 수 없습니다.',
    }),
    ApiQuery({
      name: 'courseCode',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'professorName',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'criteria',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'direction',
      required: true,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '강의평 조회 성공',
      type: GetCourseReviewsResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COURSE_NOT_FOUND',
      'COURSE_REVIEW_NOT_VIEWABLE',
    ]),
  ],
  toggleRecommendCourseReview: [
    ApiOperation({
      summary: '강의평 추천',
      description:
        '강의평에 추천을 누릅니다. 이미 추천한 강의평이면 추천이 취소됩니다. 내가 쓴 강의평은 추천할 수 없습니다.',
    }),
    ApiParam({
      name: 'courseReviewId',
      required: true,
      type: Number,
    }),
    ApiResponse({
      status: 201,
      description: '강의평 추천/추천 취소 성공',
      type: CourseReviewResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COURSE_REVIEW_NOT_FOUND',
      'COURSE_REVIEW_NOT_VIEWABLE',
      'SELF_REVIEW_RECOMMENDATION_FORBIDDEN',
    ]),
  ],
  getCoursesWithRecentCourseReviews: [
    ApiOperation({
      summary: '최근 강의평이 등록된 강의 관련 정보 조회',
      description: '최근 강의평이 등록된 강의 관련 정보를 조회합니다.',
    }),
    ApiQuery({
      name: 'limit',
      required: true,
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: '최근 강의평이 등록된 강의 관련 정보 조회 성공 시',
      type: GetCoursesWithRecentCourseReviewsResponseDto,
    }),
  ],
};

export function CourseReviewDocs(target: typeof CourseReviewController) {
  for (const key in CourseReviewDocsMap) {
    const methodDecorators =
      CourseReviewDocsMap[key as keyof typeof CourseReviewDocsMap];

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
