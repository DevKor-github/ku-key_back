import { Injectable } from '@nestjs/common';
import { PostEntity } from 'src/entities/post.entity';
import {
  DataSource,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getPostsByBoardId(
    boardId: number,
    take: number,
    cursor: Date,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { boardId: boardId, createdAt: LessThanOrEqual(cursor) },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'postScraps'],
      take: take,
    });
    return posts;
  }

  async getPostsByBoardIdwithKeyword(
    boardId: number,
    keyword: string,
    take: number,
    cursor: Date,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: [
        {
          boardId: boardId,
          title: ILike(`%${keyword}%`),
          createdAt: LessThanOrEqual(cursor),
        },
        {
          boardId: boardId,
          content: ILike(`%${keyword}%`),
          createdAt: LessThanOrEqual(cursor),
        },
      ],
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'postScraps'],
      take: take,
    });
    return posts;
  }

  async getAllPosts(take: number, cursor: Date): Promise<PostEntity[]> {
    const posts = await this.find({
      where: {
        createdAt: LessThanOrEqual(cursor),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board', 'postScraps'],
      take: take,
    });
    return posts;
  }

  async getAllPostsWithKeyword(
    keyword: string,
    take: number,
    cursor: Date,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: [
        { title: ILike(`%${keyword}%`), createdAt: LessThanOrEqual(cursor) },
        { content: ILike(`%${keyword}%`), createdAt: LessThanOrEqual(cursor) },
      ],
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board', 'postScraps'],
      take: take,
    });
    return posts;
  }

  async getHotPosts(take: number, cursor: Date): Promise<PostEntity[]> {
    const posts = await this.find({
      where: {
        allReactionCount: MoreThanOrEqual(10),
        createdAt: LessThanOrEqual(cursor),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board', 'postScraps'],
      take: take,
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
      relations: [
        'user',
        'postImages',
        'comments.user',
        'comments.commentLikes',
        'commentAnonymousNumbers',
        'postScraps',
        'postReactions',
      ],
    });
    return post;
  }

  async getPostsByUserId(
    userId: number,
    take: number,
    cursor: Date,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { userId: userId, createdAt: LessThanOrEqual(cursor) },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board', 'postScraps'],
      take: take,
    });
    return posts;
  }

  async getPostsByPostIds(
    postIds: number[],
    take: number,
    cursor: Date,
  ): Promise<PostEntity[]> {
    const posts = await this.find({
      where: { id: In(postIds), createdAt: LessThanOrEqual(cursor) },
      order: {
        createdAt: 'DESC',
      },
      relations: ['postImages', 'user', 'board', 'postScraps'],
      take: take,
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
      relations: [
        'postImages',
        'comments.commentLikes',
        'postScraps',
        'postReactions',
        'commentAnonymousNumbers',
      ],
    });
    const deleteResult = await this.softRemove(post);
    return deleteResult.deletedAt ? true : false;
  }

  async isExistingPostId(postId: number): Promise<PostEntity> {
    const post = await this.findOne({
      where: { id: postId },
    });

    return post;
  }
}
