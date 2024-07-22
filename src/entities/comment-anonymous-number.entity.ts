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

@Entity('comment_anonymous_number')
export class CommentAnonymousNumberEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  postId: number;

  @Column('int', { nullable: false })
  anonymousNumber: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.commentAnonymousNumbers,
    {
      onDelete: 'CASCADE',
    },
  )
  user: UserEntity;

  @JoinColumn({ name: 'postId' })
  @ManyToOne(
    () => PostEntity,
    (postEntity) => postEntity.commentAnonymousNumbers,
    {
      onDelete: 'CASCADE',
    },
  )
  post: PostEntity;
}
