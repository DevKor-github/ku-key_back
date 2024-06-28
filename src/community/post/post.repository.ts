import { Injectable } from '@nestjs/common';
import { PostEntity } from 'src/entities/post.entity';
import { DataSource, ILike, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getPostsbyBoardId(boardId: number): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { boardId: boardId },
      relations: ['postImages', 'comments', 'user'],
    });
    return posts;
  }

  async getPostsbyBoardIdwithKeyword(
    boardId: number,
    keyword: string,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: [
        { boardId: boardId, title: ILike(`%${keyword}%`) },
        { boardId: boardId, content: ILike(`%${keyword}%`) },
      ],
      relations: ['postImages', 'comments', 'user'],
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

  async updatePost(
    postId: number,
    title: string,
    content: string,
    isAnonymous: boolean,
  ): Promise<boolean> {
    const result = await this.update(
      { id: postId },
      {
        title: title,
        content: content,
        isAnonymous: isAnonymous,
      },
    );

    return result.affected ? true : false;
  }

  async deletePost(postId: number): Promise<boolean> {
    const deleteResult = await this.softDelete({ id: postId });
    return deleteResult.affected ? true : false;
  }

  async isExistingPostId(postId: number): Promise<boolean> {
    const post = await this.findOne({
      where: { id: postId },
    });

    return post ? true : false;
  }
}
