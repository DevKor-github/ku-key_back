import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AttendanceCheckController } from 'src/attendance-check/attendance-check.controller';
import { TakeAttendanceResponseDto } from 'src/attendance-check/dto/take-attendance.dto';
import { MethodNames } from 'src/common/types/method';

type AttendanceCheckEndPoints = MethodNames<AttendanceCheckController>;

const AttendanceCheckDocsMap: Record<
  AttendanceCheckEndPoints,
  MethodDecorator[]
> = {
  takeAttendance: [
    ApiOperation({
      summary: '출석 체크',
      description: '이미 출석한 날에는 더 이상 출석할 수 없습니다.',
    }),
    ApiResponse({
      status: 201,
      description: '출석 체크 성공',
      type: TakeAttendanceResponseDto,
    }),
  ],
  isTodayAttendanceChecked: [
    ApiOperation({
      summary: '오늘 출석 체크 여부 확인',
      description: '오늘 출석을 이미 했는지 확인합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '출석 체크 여부 확인 성공 (했으면 true, 안했으면 false)',
      type: Boolean,
    }),
  ],
};

export function AttendanceCheckDocs(target: typeof AttendanceCheckController) {
  for (const key in AttendanceCheckDocsMap) {
    const methodDecorators =
      AttendanceCheckDocsMap[key as keyof typeof AttendanceCheckDocsMap];

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
