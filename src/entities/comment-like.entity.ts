import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';

@Entity('comment_like')
export class CommentLikeEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  commentId: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.commentLikes, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'commentId' })
  @ManyToOne(
    () => CommentEntity,
    (commentEntity) => commentEntity.commentLikes,
    {
      onDelete: 'CASCADE',
    },
  )
  comment: CommentEntity;
}
