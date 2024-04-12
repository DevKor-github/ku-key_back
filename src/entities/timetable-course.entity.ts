import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { TimeTableEntity } from './timetable.entity';
import { CourseEntity } from './course.entity';

@Entity('time_table_course')
export class TimeTableCourseEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({nullable:false})
  timeTableId: number;

  @Column({nullable:false})
  courseId: number;

  @JoinColumn({name: 'timeTableId'})
  @ManyToOne(()=>TimeTableEntity, timeTableEntity => timeTableEntity.timeTableCourse,{
    onDelete: 'CASCADE',
  })
  timeTable: TimeTableEntity;

  @JoinColumn({name: 'courseId'})
  @ManyToOne(()=>CourseEntity, courseEntity => courseEntity.timeTableCourse, {
    onDelete: 'CASCADE',
  })
  course: CourseEntity;
}
