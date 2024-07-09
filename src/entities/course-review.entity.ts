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
import { CourseReviewRecommendEntity } from './course-review-recommend.entity';

@Entity('course_review')
export class CourseReviewEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('varchar', { nullable: false })
  reviewer: string;

  @Column('int', { nullable: false })
  rate: number;

  @Column('int', { nullable: false })
  classLevel: number;

  @Column('int', { nullable: false })
  teamProject: number;

  @Column('int', { nullable: false })
  amountLearned: number;

  @Column('int', { nullable: false })
  teachingSkills: number;

  @Column('int', { nullable: false })
  attendance: number;

  @Column('int', { nullable: false, default: 0 })
  recommendCount: number;

  @Column('varchar', { nullable: false, length: 1000 })
  textReview: string;

  @Column('varchar', { nullable: false })
  professorName: string;

  @Column('varchar', { nullable: false })
  year: string;

  @Column('varchar', { nullable: false })
  semester: string;

  @Column('varchar', { nullable: false })
  courseCode: string;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (user) => user.courseReviews, {
    nullable: false,
  })
  user: UserEntity;

  @OneToMany(
    () => CourseReviewRecommendEntity,
    (courseReviewRecommendEntity) => courseReviewRecommendEntity.courseReview,
    { cascade: true },
  )
  courseReviewRecommends: CourseReviewRecommendEntity[];
}
