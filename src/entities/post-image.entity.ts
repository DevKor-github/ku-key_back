import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { PostEntity } from './post.entity';

@Entity('post_image')
export class PostImageEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  postId: number;

  @Column('varchar', { nullable: false })
  imgDir: string;

  @JoinColumn({ name: 'postId' })
  @ManyToOne(() => PostEntity, (postEntity) => postEntity.postImages, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
