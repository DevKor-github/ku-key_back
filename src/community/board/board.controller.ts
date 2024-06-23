import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BoardService } from './board.service';
import { getBoardResponseDto } from './dto/get-board.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('board')
@ApiTags('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '게시판 목록 조회',
    description: '게시판의 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게시판 목록 조회 성공',
    type: [getBoardResponseDto],
  })
  async getBoardList(): Promise<getBoardResponseDto[]> {
    return this.boardService.getBoardList();
  }
}
