import { Injectable } from '@nestjs/common';
import { PostScrapEntity } from 'src/entities/post-scrap.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostScrapRepository extends Repository<PostScrapEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PostScrapEntity, dataSource.createEntityManager());
  }

  async createPostScrap(
    userId: number,
    postId: number,
  ): Promise<PostScrapEntity> {
    const postScrap = this.create({
      userId: userId,
      postId: postId,
    });

    return await this.save(postScrap);
  }

  async deletePostScrap(userId: number, postId: number): Promise<boolean> {
    const deleteResult = await this.delete({
      userId: userId,
      postId: postId,
    });

    return deleteResult.affected ? true : false;
  }
}
