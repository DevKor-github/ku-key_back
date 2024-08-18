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
import { CourseReviewEntity } from './course-review.entity';
import { CourseReviewRecommendEntity } from './course-review-recommend.entity';
import { ClubLikeEntity } from './club-like.entity';
import { PointHistoryEntity } from './point-history.entity';
import { PostScrapEntity } from './post-scrap.entity';
import { PostReactionEntity } from './post-reaction.entity';
import { CommentLikeEntity } from './comment-like.entity';
import { CommentAnonymousNumberEntity } from './comment-anonymous-number.entity';
import { ReportEntity } from './report.entity';
import { NoticeEntity } from './notice.entity';
import { AttendanceCheckEntity } from './attendance-check.entity';
import { Role } from 'src/enums/role.enum';
import { UserLanguageEntity } from './user-language.entity';

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

  @Column('varchar', { default: '기본 이미지 링크' })
  profileImageDir: string;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;

  @Column('boolean', { default: false })
  isViewable: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @OneToOne(
    () => KuVerificationEntity,
    (kuVerification) => kuVerification.user,
    { cascade: true },
  )
  kuVerification: KuVerificationEntity;

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.fromUser, {
    cascade: true,
  })
  sentFriendRequests: FriendshipEntity[];

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.toUser, {
    cascade: true,
  })
  receivedFriendRequests: FriendshipEntity[];

  @OneToMany(() => TimetableEntity, (timetableEntity) => timetableEntity.user, {
    cascade: true,
  })
  timetables: TimetableEntity[];

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.user)
  comments: CommentEntity[];

  @OneToMany(
    () => CourseReviewEntity,
    (courseReviewEntity) => courseReviewEntity.user,
  )
  courseReviews: CourseReviewEntity[];

  @OneToMany(
    () => CourseReviewRecommendEntity,
    (courseReviewRecommendEntity) => courseReviewRecommendEntity.user,
  )
  courseReviewRecommends: CourseReviewRecommendEntity[];

  @OneToMany(() => ClubLikeEntity, (clubLike) => clubLike.user)
  clubLikes: ClubLikeEntity[];

  @OneToMany(
    () => PointHistoryEntity,
    (pointHistoryEntity) => pointHistoryEntity.user,
    { cascade: true },
  )
  pointHistories: PointHistoryEntity[];

  @OneToMany(() => PostScrapEntity, (postScrapEntity) => postScrapEntity.user)
  postScraps: PostScrapEntity[];

  @OneToMany(
    () => PostReactionEntity,
    (postReactionEntity) => postReactionEntity.user,
  )
  postReaction: PostReactionEntity[];

  @OneToMany(
    () => CommentLikeEntity,
    (commentLikeEntity) => commentLikeEntity.user,
  )
  commentLikes: CommentLikeEntity[];

  @OneToMany(
    () => CommentAnonymousNumberEntity,
    (commentAnonymousNumberEntity) => commentAnonymousNumberEntity.user,
    { cascade: true },
  )
  commentAnonymousNumbers: CommentAnonymousNumberEntity[];

  @OneToMany(() => ReportEntity, (reportEntity) => reportEntity.user)
  reports: ReportEntity[];

  @OneToMany(() => NoticeEntity, (noticeEntity) => noticeEntity.user, {
    cascade: true,
  })
  notices: NoticeEntity[];

  @OneToMany(
    () => AttendanceCheckEntity,
    (attendanceCheckEntity) => attendanceCheckEntity.user,
    { cascade: true },
  )
  attendanceChecks: AttendanceCheckEntity[];

  @OneToMany(
    () => UserLanguageEntity,
    (userLanguageEntity) => userLanguageEntity.user,
    { cascade: true },
  )
  userLanguages: UserLanguageEntity[];
}
