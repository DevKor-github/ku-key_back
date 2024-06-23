import { Injectable } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { getBoardResponseDto } from './dto/get-board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getBoardList(): Promise<getBoardResponseDto[]> {
    const boards = await this.boardRepository.getBoardList();
    return boards.map((board) => new getBoardResponseDto(board));
  }
}
