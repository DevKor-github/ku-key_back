import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('course_review')
export class CourseReviewEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

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

  @Column('int', { nullable: false })
  recommended: number;

  @Column('varchar', { nullable: false })
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
}
