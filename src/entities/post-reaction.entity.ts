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

@Entity('post_reaction')
export class PostReactionEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  postId: number;

  @Column('tinyint', { nullable: false })
  reaction: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.postScraps, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'postId' })
  @ManyToOne(() => PostEntity, (postEntity) => postEntity.postScraps, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
