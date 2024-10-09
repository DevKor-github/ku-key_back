import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BoardService } from './board.service';
import { getBoardResponseDto } from './dto/get-board.dto';
import { ApiTags } from '@nestjs/swagger';
import { BoardDocs } from 'src/decorators/docs/board.decorator';

@Controller('board')
@ApiTags('board')
@BoardDocs
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBoardList(): Promise<getBoardResponseDto[]> {
    return this.boardService.getBoardList();
  }
}
