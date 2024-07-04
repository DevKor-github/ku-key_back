import { ApiProperty } from '@nestjs/swagger';
import { BoardEntity } from 'src/entities/board.entity';

export class getBoardResponseDto {
  constructor(boardEntity: BoardEntity) {
    this.id = boardEntity.id;
    this.name = boardEntity.name;
  }

  @ApiProperty({ description: '게시판 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시판 이름' })
  name: string;
}
