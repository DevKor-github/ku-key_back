import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CalendarController } from 'src/home/calendar/calendar.controller';
import { CreateCalendarDataRequestDto } from 'src/home/calendar/dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from 'src/home/calendar/dto/create-calendar-data-response.dto';
import { DeleteCalendarDataResponseDto } from 'src/home/calendar/dto/delete-calendar-data-response-dto';
import { GetAcademicScheduleDataResponseDto } from 'src/home/calendar/dto/get-academic-schedule-response.dto';
import { GetBannerImageUrlResponseDto } from 'src/home/calendar/dto/get-banner-images-response.dto';
import { GetDailyCalendarDataResponseDto } from 'src/home/calendar/dto/get-calendar-data-response-dto';
import { UpdateCalendarDataRequestDto } from 'src/home/calendar/dto/update-calendar-data-request.dto';
import { UpdateCalendarDataResponseDto } from 'src/home/calendar/dto/update-calendar-data-response.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type CalendarEndPoints = MethodNames<CalendarController>;

const CalendarDocsMap: Record<CalendarEndPoints, MethodDecorator[]> = {
  getMonthlyCalendarData: [
    ApiOperation({
      summary: '연도, 월별 행사/일정 조회',
      description:
        '연도, 월 정보를 받아 그 달의 행사/일정을 조회합니다. 행사/일정 존재여부에 상관없이 그 달의 모든 날짜를 반환합니다.',
    }),
    ApiQuery({ name: 'year', required: true, description: '연도' }),
    ApiQuery({ name: 'month', required: true, description: '월' }),
    ApiOkResponse({
      description: '특정 연도, 월별 행사/일정 데이터 반환',
      isArray: true,
      type: GetDailyCalendarDataResponseDto,
    }),
  ],
  getAcademicScheduleData: [
    ApiOperation({
      summary: 'Academic Schedule 행사/일정 조회',
      description:
        '연도, 학기 정보를 받아 Academic Schedule에 해당하는 행사/일정을 조회합니다. 행사/일정이 존재하는 날짜의 경우에만 가져옵니다.',
    }),
    ApiQuery({ name: 'year', required: true, description: '연도' }),
    ApiQuery({ name: 'semester', required: true, description: '학기' }),
    ApiOkResponse({
      description: '특정 연도, 학기별 Academic Schedule 행사/일정 데이터 반환',
      isArray: true,
      type: GetAcademicScheduleDataResponseDto,
    }),
  ],
  createCalendarData: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '특정 날짜 행사/일정 생성',
      description: 'admin page에서 특정 날짜의 행사/일정을 생성합니다.',
    }),
    ApiBody({ type: CreateCalendarDataRequestDto }),
    ApiCreatedResponse({
      description: '행사/일정 생성 성공',
      type: CreateCalendarDataResponseDto,
    }),
  ],
  updateCalendarData: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '특정 행사/일정 수정',
      description:
        '행사/일정 id를 받아 admin page에서 해당하는 행사/일정을 수정합니다.',
    }),
    ApiParam({ name: 'calendarId', description: '행사/일정 id' }),
    ApiBody({ type: UpdateCalendarDataRequestDto }),
    ApiOkResponse({
      description: '행사/일정 수정 성공',
      type: UpdateCalendarDataResponseDto,
    }),
    ApiKukeyExceptionResponse(['CALENDAR_NOT_FOUND', 'CALENDAR_UPDATE_FAILED']),
  ],
  deleteCalendarData: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '특정 행사/일정 삭제',
      description:
        '행사/일정 id를 받아 admin page에서 해당하는 행사/일정을 삭제합니다.',
    }),
    ApiParam({ name: 'calendarId', description: '행사/일정 id' }),
    ApiOkResponse({
      description: '행사/일정 삭제 성공',
      type: DeleteCalendarDataResponseDto,
    }),
    ApiKukeyExceptionResponse(['CALENDAR_NOT_FOUND', 'CALENDAR_DELETE_FAILED']),
  ],
  getBannerImageUrls: [
    ApiOperation({
      summary: '메인 홈 배너 이미지 URL 목록 조회',
      description: 'S3에 저장된 메인 홈 배너 이미지 URL 목록을 조회합니다.',
    }),
    ApiOkResponse({
      description: 'URL 목록 반환',
      type: [GetBannerImageUrlResponseDto],
    }),
  ],
};

export function CalendarDocs(target: typeof CalendarController) {
  for (const key in CalendarDocsMap) {
    const methodDecorators =
      CalendarDocsMap[key as keyof typeof CalendarDocsMap];

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
