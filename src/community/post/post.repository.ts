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

  async createPost(
    userId: number,
    boardId: number,
    title: string,
    content: string,
    isAnonymous: boolean,
  ): Promise<PostEntity> {
    const post = this.create({
      userId: userId,
      boardId: boardId,
      title: title,
      content: content,
      isAnonymous: isAnonymous,
    });

    return await this.save(post);
  }

  async getPostbyPostId(postId: number): Promise<PostEntity> {
    const post = await this.findOne({
      where: { id: postId },
      relations: ['user', 'postImages', 'comments'],
    });
    return post;
  }
}
