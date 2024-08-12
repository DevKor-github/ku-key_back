import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CourseReviewEntity } from './course-review.entity';
import { CommonEntity } from './common.entity';

@Entity('course_review_recommend')
@Index(['userId', 'courseReviewId'], { unique: true })
export class CourseReviewRecommendEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: false })
  courseReviewId: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (user) => user.courseReviewRecommends, {
    onDelete: 'SET NULL',
  })
  user: UserEntity;

  @JoinColumn({ name: 'courseReviewId' })
  @ManyToOne(
    () => CourseReviewEntity,
    (courseReview) => courseReview.courseReviewRecommends,
    { onDelete: 'CASCADE' },
  )
  courseReview: CourseReviewEntity;
}
