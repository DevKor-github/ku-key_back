import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { AcceptReportRequestDto } from 'src/community/report/dto/accept-report.dto';
import {
  CreateReportRequestDto,
  CreateReportResponseDto,
} from 'src/community/report/dto/create-report.dto';
import { GetReportListResponseDto } from 'src/community/report/dto/get-report-list.dto';
import { GetReportResponseDto } from 'src/community/report/dto/get-report.dto';
import { ReportController } from 'src/community/report/report.controller';
import { ApiKukeyExceptionResponse } from 'src/decorators/api-kukey-exception-response';

type ReportEndPoints = MethodNames<ReportController>;

const ReportDocsMap: Record<ReportEndPoints, MethodDecorator[]> = {
  getReportList: [
    ApiOperation({
      summary: '신고 목록 조회',
      description: '신고 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 201,
      description: '신고 목록 조회 성공',
      type: [GetReportListResponseDto],
    }),
  ],
  getReport: [
    ApiOperation({
      summary: '신고 세부내용 조회',
      description: '신고 세부내용을 조회합니다.',
    }),
    ApiParam({
      name: 'reportId',
      description: '신고 고유 ID',
    }),
    ApiResponse({
      status: 201,
      description: '신고 목록 조회 성공',
      type: GetReportResponseDto,
    }),
  ],
  acceptReport: [
    ApiOperation({
      summary: '신고 승인',
      description: '신고를 승인합니다.',
    }),
    ApiParam({
      name: 'reportId',
      description: '신고 고유 ID',
    }),
    ApiBody({
      type: AcceptReportRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '신고 승인 성공',
    }),
  ],
  rejectReport: [
    ApiOperation({
      summary: '신고 거부',
      description: '신고를 거부합니다.',
    }),
    ApiParam({
      name: 'reportId',
      description: '신고 고유 ID',
    }),
    ApiResponse({
      status: 201,
      description: '신고 거부 성공',
    }),
  ],
  createReport: [
    ApiOperation({
      summary: '신고 생성',
      description: '신고를 생성합니다.',
    }),
    ApiBody({
      type: CreateReportRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '신고 생성 성공',
      type: CreateReportResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'ALREADY_REPORTED',
      'POST_NOT_FOUND',
      'COMMENT_NOT_FOUND',
    ]),
  ],
};

export function ReportDocs(target: typeof ReportController) {
  for (const key in ReportDocsMap) {
    const methodDecorators = ReportDocsMap[key as keyof typeof ReportDocsMap];

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
