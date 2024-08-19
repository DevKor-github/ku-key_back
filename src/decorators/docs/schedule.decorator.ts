import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CreateScheduleRequestDto } from 'src/schedule/dto/create-schedule-request.dto';
import { CreateScheduleResponseDto } from 'src/schedule/dto/create-schedule-response.dto';
import { DeleteScheduleResponseDto } from 'src/schedule/dto/delete-schedule-response.dto';
import { UpdateScheduleRequestDto } from 'src/schedule/dto/update-schedule-request.dto';
import { UpdateScheduleResponseDto } from 'src/schedule/dto/update-schedule-response.dto';
import { ScheduleController } from 'src/schedule/schedule.controller';

type ScheduleEndPoints = MethodNames<ScheduleController>;

const ScheduleDocsMap: Record<ScheduleEndPoints, MethodDecorator[]> = {
  createSchedule: [
    ApiOperation({
      summary: '시간표에 개인 스케쥴 추가',
      description:
        '시간표에 개인 스케쥴을 추가합니다. 해당 시간에 이미 등록된 개인 스케쥴이나 강의가 있을 경우 추가되지 않습니다.',
    }),
    ApiBody({
      type: CreateScheduleRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '스케쥴 추가 성공',
      type: CreateScheduleResponseDto,
    }),
  ],
  updateSchedule: [
    ApiOperation({
      summary: '시간표에 개인 스케쥴 수정',
      description: '시간표에 등록된 개인 스케쥴을 수정합니다.',
    }),
    ApiParam({
      name: 'scheduleId',
      type: 'number',
      required: true,
      description: '수정할 스케쥴 ID',
    }),
    ApiBody({
      type: UpdateScheduleRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '스케쥴 수정 성공 시',
      type: UpdateScheduleResponseDto,
    }),
  ],
  deleteSchedule: [
    ApiOperation({
      summary: '시간표에 개인 스케쥴 삭제',
      description: '시간표에 등록된 개인 스케쥴을 삭제합니다.',
    }),
    ApiParam({
      name: 'scheduleId',
      type: 'number',
      required: true,
      description: '삭제할 스케쥴 ID',
    }),
    ApiResponse({
      status: 200,
      description: '스케쥴 삭제 성공 시',
      type: DeleteScheduleResponseDto,
    }),
  ],
};

export function ScheduleDocs(target: typeof ScheduleController) {
  for (const key in ScheduleDocsMap) {
    const methodDecorators =
      ScheduleDocsMap[key as keyof typeof ScheduleDocsMap];

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
