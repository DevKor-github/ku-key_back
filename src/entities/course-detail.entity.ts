import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { CourseEntity } from './course.entity';

@Entity('course_detail')
export class CourseDetailEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { nullable: true })
  day: string;

  @Column('time', { nullable: true })
  startTime: string;

  @Column('time', { nullable: true })
  endTime: string;

  @Column('varchar', { nullable: true })
  classroom: string;

  @Column('varchar', { nullable: true })
  period: string;

  @Column({ nullable: false })
  courseId: number;

  @JoinColumn({ name: 'courseId' })
  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.courseDetails, {
    onDelete: 'CASCADE',
  })
  course: CourseEntity;
}
