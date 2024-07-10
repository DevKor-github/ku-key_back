import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { TimetableEntity } from './timetable.entity';
import { CourseEntity } from './course.entity';

@Entity('timetable_course')
export class TimetableCourseEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  timetableId: number;

  @Column({ nullable: false })
  courseId: number;

  @JoinColumn({ name: 'timetableId' })
  @ManyToOne(
    () => TimetableEntity,
    (timetableEntity) => timetableEntity.timetableCourses,
    {
      onDelete: 'CASCADE',
    },
  )
  timetable: TimetableEntity;

  @JoinColumn({ name: 'courseId' })
  @ManyToOne(
    () => CourseEntity,
    (courseEntity) => courseEntity.timetableCourses,
    {
      onDelete: 'CASCADE',
    },
  )
  course: CourseEntity;
}
