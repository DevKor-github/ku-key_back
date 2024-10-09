import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { BoardController } from 'src/community/board/board.controller';
import { getBoardResponseDto } from 'src/community/board/dto/get-board.dto';

type BoardEndPoints = MethodNames<BoardController>;

const BoardDocsMap: Record<BoardEndPoints, MethodDecorator[]> = {
  getBoardList: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '게시판 목록 조회',
      description: '게시판의 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '게시판 목록 조회 성공',
      type: [getBoardResponseDto],
    }),
  ],
};

export function BoardDocs(target: typeof BoardController) {
  for (const key in BoardDocsMap) {
    const methodDecorators = BoardDocsMap[key as keyof typeof BoardDocsMap];

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
