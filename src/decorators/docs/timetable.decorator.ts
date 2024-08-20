import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CommonDeleteResponseDto } from 'src/timetable/dto/common-delete-response.dto';
import { CommonTimetableResponseDto } from 'src/timetable/dto/common-timetable-response.dto';
import { CreateTimetableCourseResponseDto } from 'src/timetable/dto/create-timetable-course-response.dto';
import { CreateTimetableDto } from 'src/timetable/dto/create-timetable.dto';
import { GetTimetableByTimetableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { TimetableDto } from 'src/timetable/dto/timetable.dto';
import { UpdateTimetableColorDto } from 'src/timetable/dto/update-timetable-color.dto';
import { UpdateTimetableNameDto } from 'src/timetable/dto/update-timetable-name.dto';
import { GetTimetableByUserIdResponseDto } from 'src/timetable/dto/userId-timetable.dto';
import { TimetableController } from 'src/timetable/timetable.controller';

type TimetableEndPoints = MethodNames<TimetableController>;

const TimetableDocsMap: Record<TimetableEndPoints, MethodDecorator[]> = {
  createTimetableCourse: [
    ApiOperation({
      summary: '시간표에 강의 추가',
      description:
        '시간표에 특정 강의를 추가합니다. 해당 시간에 이미 등록된 개인 스케쥴이나 강의가 있을 경우 추가되지 않습니다.',
    }),
    ApiQuery({
      name: 'timetableId',
      type: 'number',
      required: true,
      description: '특정 시간표 ID',
    }),
    ApiQuery({
      name: 'courseId',
      type: 'number',
      required: true,
      description: '추가할 강의 ID',
    }),
    ApiResponse({
      status: 201,
      description: '강의 추가 성공 시',
      type: CreateTimetableCourseResponseDto,
    }),
  ],
  createTimetable: [
    ApiOperation({
      summary: '시간표 생성',
      description:
        '해당 연도, 학기에 시간표를 생성합니다. 처음 만들어진 시간표가 대표시간표가 되며, 한 학기에 최대 3개까지 시간표 생성이 가능합니다.',
    }),
    ApiBody({
      type: CreateTimetableDto,
    }),
    ApiResponse({
      status: 201,
      description: '시간표 생성 성공 시',
      type: CommonTimetableResponseDto,
    }),
  ],
  getMainTimetable: [
    ApiOperation({
      summary: '대표 시간표 조회',
      description: '해당 유저의 대표 시간표를 조회합니다.',
    }),
    ApiQuery({
      name: 'year',
      type: 'string',
      required: true,
      description: '연도',
    }),
    ApiQuery({
      name: 'semester',
      type: 'string',
      required: true,
      description: '학기',
    }),
    ApiResponse({
      status: 200,
      description: '대표 시간표 조회 성공 시',
      type: CommonTimetableResponseDto,
    }),
  ],
  getTimetableByUserId: [
    ApiOperation({
      summary: '유저의 ID로 시간표 관련 정보 조회',
      description:
        '해당 유저가 가지고 있는 시간표의 ID 리스트, 각각의 학기, 대표 시간표 여부, 시간표 이름을 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '유저 ID로 시간표 리스트 조회 성공 시',
      type: GetTimetableByUserIdResponseDto,
      isArray: true,
    }),
  ],
  getTimetableByTimetableId: [
    ApiOperation({
      summary: '시간표 ID로 시간표 관련 정보 조회',
      description:
        '시간표 ID로 해당 시간표와 관련된 강의,일정 정보를 반환합니다.',
    }),
    ApiParam({
      name: 'timetableId',
      description: '특정 시간표 ID',
    }),
    ApiResponse({
      status: 200,
      description: '특정 시간표 ID로 조회 성공 시',
      type: GetTimetableByTimetableIdDto,
    }),
  ],
  deleteTimetableCourse: [
    ApiOperation({
      summary: '시간표에 등록한 강의 삭제',
      description: '해당 시간표에 등록한 특정 강의를 삭제합니다.',
    }),
    ApiQuery({
      name: 'timetableId',
      type: 'number',
      required: true,
      description: '특정 시간표 ID',
    }),
    ApiQuery({
      name: 'courseId',
      type: 'number',
      required: true,
      description: '삭제할 강의 ID',
    }),
    ApiResponse({
      status: 200,
      description: '시간표에 등록한 강의 삭제 성공 시',
      type: CommonDeleteResponseDto,
    }),
  ],
  deleteTimetable: [
    ApiOperation({
      summary: '시간표 삭제',
      description:
        '특정 시간표를 삭제합니다. 삭제 시 해당 시간표에 등록된 모든 강의도 삭제됩니다.',
    }),
    ApiParam({
      name: 'timetableId',
      description: '삭제할 시간표 ID',
    }),
    ApiResponse({
      status: 200,
      description: '시간표 삭제 성공 시',
      type: CommonDeleteResponseDto,
    }),
  ],
  updateTimetableColor: [
    ApiOperation({
      summary: '시간표 색상 변경',
      description: '특정 시간표의 색상을 변경합니다.',
    }),
    ApiParam({
      name: 'timetableId',
      description: '변경할 시간표 ID',
    }),
    ApiBody({
      type: UpdateTimetableColorDto,
    }),
    ApiResponse({
      status: 200,
      description: '시간표 색상 변경 성공 시',
      type: CommonTimetableResponseDto,
    }),
  ],
  updateTimetableName: [
    ApiOperation({
      summary: '시간표 이름 변경',
      description: '특정 시간표의 이름을 변경합니다.',
    }),
    ApiParam({
      name: 'timetableId',
      description: '변경할 시간표 ID',
    }),
    ApiBody({
      type: UpdateTimetableNameDto,
    }),
    ApiResponse({
      status: 200,
      description: '시간표 이름 변경 성공 시',
      type: CommonTimetableResponseDto,
    }),
  ],
  updateMainTimetable: [
    ApiOperation({
      summary: '대표 시간표 변경',
      description:
        '특정 시간표를 대표 시간표로 변경합니다. 기존에 이미 대표시간표이면 변경되지 않습니다.',
    }),
    ApiParam({
      name: 'timetableId',
      description: '대표 시간표로 변경할 시간표 ID',
    }),
    ApiBody({
      type: TimetableDto,
    }),
    ApiResponse({
      status: 200,
      description: '대표 시간표 변경 성공 시',
      type: CommonTimetableResponseDto,
    }),
  ],
};

export function TimetableDocs(target: typeof TimetableController) {
  for (const key in TimetableDocsMap) {
    const methodDecorators =
      TimetableDocsMap[key as keyof typeof TimetableDocsMap];

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
