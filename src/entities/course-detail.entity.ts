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

  @Column('varchar', { nullable: false })
  day: string;

  @Column('time', { nullable: false })
  startTime: string;

  @Column('time', { nullable: false })
  endTime: string;

  @Column('varchar', { nullable: false })
  classroom: string;

  @Column({nullable: false})
  courseId: number;

  @JoinColumn({ name: 'courseId' })
  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.courseDetail, {
    onDelete: 'CASCADE',
  })
  course: CourseEntity;
}
