import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { BoardEntity } from './board.entity';
import { PostImageEntity } from './post-image.entity';
import { CommentEntity } from './comment.entity';

@Entity('post')
export class PostEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  boardId: number;

  @Column('varchar', { nullable: false })
  title: string;

  @Column('text', { nullable: false })
  content: string;

  @Column('boolean', { nullable: false })
  isAnonymous: boolean;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.posts, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'boardId' })
  @ManyToOne(() => BoardEntity, (boardEntity) => boardEntity.posts)
  board: BoardEntity;

  @OneToMany(() => PostImageEntity, (postImageEntity) => postImageEntity.post)
  postImages: PostImageEntity[];

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.post)
  comments: CommentEntity[];
}