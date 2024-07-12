import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CourseDetailEntity } from './course-detail.entity';
import { TimetableCourseEntity } from './timetable-course.entity';

@Entity('course')
export class CourseEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { nullable: false })
  professorName: string;

  @Column('varchar', { nullable: false })
  category: string;

  @Column('varchar', { nullable: true })
  college: string;

  @Column('varchar', { nullable: false })
  courseName: string;

  @Column('varchar', { nullable: false })
  courseCode: string;

  @Column('int', { nullable: false })
  credit: number;

  @Column('varchar', { nullable: true })
  major: string;

  @Column('boolean', { nullable: false })
  hasExchangeSeat: boolean;

  @Column('varchar', { nullable: false })
  year: string;

  @Column('varchar', { nullable: false })
  semester: string;

  @Column('varchar', { nullable: false })
  syllabus: string;

  @OneToMany(
    () => CourseDetailEntity,
    (courseDetailEntity) => courseDetailEntity.course,
  )
  courseDetails: CourseDetailEntity[];

  @OneToMany(
    () => TimetableCourseEntity,
    (timetableCourseEntity) => timetableCourseEntity.course,
  )
  timetableCourses: TimetableCourseEntity[];
}
