import { Injectable } from '@nestjs/common';
import { PostEntity } from 'src/entities/post.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getPostsbyBoardId(boardId: number): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { boardId: boardId },
      relations: ['postImages', 'comments'],
    });
    return posts;
  }
}
