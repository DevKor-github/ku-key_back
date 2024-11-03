import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CursorPageResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { MethodNames } from 'src/common/types/method';
import { GetNoticeResponseDto } from 'src/notice/dto/get-notice.dto';
import { NoticeController } from 'src/notice/notice.controller';

type NoticeEndPoints = MethodNames<NoticeController>;

const NoticeDocsMap: Record<NoticeEndPoints, MethodDecorator[]> = {
  sse: [
    ApiOperation({
      summary: '알림 연결',
      description: 'SSE를 통해 서버에서 넘겨주는 알림을 연결합니다.',
    }),
  ],
  sseWithParam: [
    ApiOperation({
      summary: '알림 연결',
      description:
        'SSE를 통해 서버에서 넘겨주는 알림을 연결합니다. (access토큰 만료됨에 따라 연결이 끊길 경우 사용)',
    }),
  ],
  getNotices: [
    ApiOperation({
      summary: '알림 조회',
      description:
        '받았던 알림들을 조회합니다. 커뮤니티 관련 알림일 경우 해당 게시글의 Id를 함께 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '알림 조회 성공',
      type: CursorPageResponseDto<GetNoticeResponseDto>,
    }),
  ],
};

export function NoticeDocs(target: typeof NoticeController) {
  for (const key in NoticeDocsMap) {
    const methodDecorators = NoticeDocsMap[key as keyof typeof NoticeDocsMap];

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
