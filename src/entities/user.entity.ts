import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { KuVerificationEntity } from './ku-verification.entity';
import { FriendshipEntity } from './friendship.entity';
import { TimetableEntity } from './timetable.entity';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';

@Entity('user')
export class UserEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { nullable: false })
  homeUniversity: string;

  @Column('varchar', { nullable: false })
  country: string;

  @Column('varchar', { nullable: false })
  major: string;

  @Column('boolean', { default: false })
  isVerified: boolean;

  @Column('varchar', { nullable: false })
  name: string;

  @Column('timestamp', { nullable: true })
  startDay: Date | null;

  @Column('timestamp', { nullable: true })
  endDay: Date | null;

  @Column('int', { default: 0 })
  point: number;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;

  @OneToOne(
    () => KuVerificationEntity,
    (kuVerification) => kuVerification.user,
    { cascade: true },
  )
  kuVerification: KuVerificationEntity;

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.fromUser)
  sentFriendRequests: FriendshipEntity[];

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.toUser)
  receivedFriendRequests: FriendshipEntity[];

  @OneToMany(() => TimetableEntity, (timetableEntity) => timetableEntity.user)
  timetables: TimetableEntity[];

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.user)
  comments: CommentEntity[];
}
