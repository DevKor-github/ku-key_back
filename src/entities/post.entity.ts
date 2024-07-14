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
import { PostScrapEntity } from './post-scrap.entity';
import { PostReactionEntity } from './post-reaction.entity';
import { CommentAnonymousNumberEntity } from './comment-anonymous-number.entity';

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

  @Column('int', { nullable: false, default: 0 })
  views: number;

  @Column('int', { nullable: false, default: 0 })
  scrapCount: number;

  @Column('int', { nullable: false, default: 0 })
  commentCount: number;

  @Column('int', { nullable: false, default: 0 })
  goodReactionCount: number;

  @Column('int', { nullable: false, default: 0 })
  sadReactionCount: number;

  @Column('int', { nullable: false, default: 0 })
  amazingReactionCount: number;

  @Column('int', { nullable: false, default: 0 })
  angryReactionCount: number;

  @Column('int', { nullable: false, default: 0 })
  funnyReactionCount: number;

  @Column('int', { nullable: false, default: 0 })
  allReactionCount: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.posts, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @JoinColumn({ name: 'boardId' })
  @ManyToOne(() => BoardEntity, (boardEntity) => boardEntity.posts)
  board: BoardEntity;

  @OneToMany(() => PostImageEntity, (postImageEntity) => postImageEntity.post, {
    cascade: true,
  })
  postImages: PostImageEntity[];

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.post, {
    cascade: true,
  })
  comments: CommentEntity[];

  @OneToMany(() => PostScrapEntity, (postScrapEntity) => postScrapEntity.post, {
    cascade: true,
  })
  postScraps: PostScrapEntity[];

  @OneToMany(
    () => PostReactionEntity,
    (postReactionEntity) => postReactionEntity.post,
    {
      cascade: true,
    },
  )
  postReactions: PostReactionEntity[];

  @OneToMany(
    () => CommentAnonymousNumberEntity,
    (commentAnonymousNumberEntity) => commentAnonymousNumberEntity.post,
    {
      cascade: true,
    },
  )
  commentAnonymousNumbers: CommentAnonymousNumberEntity[];
}
