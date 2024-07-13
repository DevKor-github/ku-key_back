import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';
import { CommentLikeEntity } from './comment-like.entity';

@Entity('comment')
export class CommentEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  postId: number;

  @Column({ nullable: true })
  parentCommentId: number;

  @Column('varchar', { nullable: false })
  content: string;

  @Column('boolean', { nullable: false })
  isAnonymous: boolean;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.comments, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'postId' })
  @ManyToOne(() => PostEntity, (postEntity) => postEntity.comments, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;

  @JoinColumn({ name: 'parentCommentId' })
  @ManyToOne(
    () => CommentEntity,
    (commentEntity) => commentEntity.replyComments,
    {
      onDelete: 'NO ACTION',
    },
  )
  parentComment: CommentEntity;

  @OneToMany(
    () => CommentEntity,
    (commentEntity) => commentEntity.parentComment,
  )
  replyComments: CommentEntity[];

  @OneToMany(
    () => CommentLikeEntity,
    (commentLikeEntity) => commentLikeEntity.comment,
  )
  commentLikes: CommentLikeEntity[];
}
