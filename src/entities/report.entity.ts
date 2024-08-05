import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';

@Entity('report')
export class ReportEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  reporterId: number;

  @Column({ nullable: false })
  postId: number;

  @Column({ nullable: true })
  commentId: number;

  @Column('varchar', { nullable: false })
  reason: string;

  @JoinColumn({ name: 'reporterId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.reports, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'postId' })
  @ManyToOne(() => PostEntity, (postEntity) => postEntity.reports, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;

  @JoinColumn({ name: 'commentId' })
  @ManyToOne(() => CommentEntity, (commentEntity) => commentEntity.reports, {
    onDelete: 'CASCADE',
  })
  comment: CommentEntity;
}
