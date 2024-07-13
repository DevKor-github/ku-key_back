import { Injectable } from '@nestjs/common';
import { PostEntity } from 'src/entities/post.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getPostsByBoardId(
    boardId: number,
    pageSize: number,
    pageNumber: number,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { boardId: boardId },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user'],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    return posts;
  }

  async getPostsByBoardIdwithKeyword(
    boardId: number,
    keyword: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: [
        { boardId: boardId, title: ILike(`%${keyword}%`) },
        { boardId: boardId, content: ILike(`%${keyword}%`) },
      ],
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user'],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
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

  async getPostByPostId(postId: number): Promise<PostEntity> {
    const post = await this.findOne({
      where: { id: postId },
      relations: ['user', 'postImages'],
    });
    return post;
  }

  async getPostByPostIdWithDeletedComment(postId: number): Promise<PostEntity> {
    const post = await this.findOne({
      where: { id: postId },
      withDeleted: true,
      relations: ['user', 'postImages', 'comments.user'],
    });
    return post;
  }

  async getPostsByUserId(
    userId: number,
    pageSize: number,
    pageNumber: number,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { userId: userId },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board'],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    return posts;
  }

  async getScrapPostsByPostIds(
    postIds: number[],
    pageSize: number,
    pageNumber: number,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { id: In(postIds) },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board'],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    return posts;
  }

  async increaseViews(postId: number): Promise<boolean> {
    const result = await this.increment({ id: postId }, 'views', 1);
    return result.affected ? true : false;
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
    const post = await this.findOne({
      where: { id: postId },
      relations: ['postImages', 'comments', 'postScraps', 'postReactions'],
    });
    const deleteResult = await this.softRemove(post);
    return deleteResult.deletedAt ? true : false;
  }

  async isExistingPostId(postId: number): Promise<boolean> {
    const post = await this.findOne({
      where: { id: postId },
    });

    return post ? true : false;
  }
}
