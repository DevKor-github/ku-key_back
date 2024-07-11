import { Injectable } from '@nestjs/common';
import { PostEntity } from 'src/entities/post.entity';
import { DataSource, ILike, Repository } from 'typeorm';

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
      relations: ['postImages', 'comments', 'user'],
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
      relations: ['postImages', 'comments', 'user'],
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
      relations: ['postImages', 'comments'],
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
