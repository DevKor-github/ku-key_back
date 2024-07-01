import { Injectable } from '@nestjs/common';
import { BoardEntity } from 'src/entities/board.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BoardRepository extends Repository<BoardEntity> {
  constructor(dataSource: DataSource) {
    super(BoardEntity, dataSource.createEntityManager());
  }

  async getBoardList(): Promise<BoardEntity[]> {
    return await this.find();
  }

  async getBoardbyId(id: number): Promise<BoardEntity> {
    return await this.findOne({ where: { id: id } });
  }
}
