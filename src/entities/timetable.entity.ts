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
import { TimetableCourseEntity } from './timetable-course.entity';
import { ScheduleEntity } from './schedule.entity';

@Entity('timetable')
export class TimetableEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('varchar', { nullable: false })
  timetableName: string;

  @Column('varchar', { nullable: false })
  semester: string;

  @Column('varchar', { nullable: false })
  year: string;

  @Column('boolean', { nullable: false, default: false })
  mainTimetable: boolean;

  @Column('varchar', { nullable: false, default: 'Red' })
  color: string;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.timetables, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @OneToMany(
    () => TimetableCourseEntity,
    (timetableCourseEntity) => timetableCourseEntity.timetable,
    { cascade: true },
  )
  timetableCourses: TimetableCourseEntity[];

  @OneToMany(
    () => ScheduleEntity,
    (scheduleEntity) => scheduleEntity.timetable,
    { cascade: true },
  )
  schedules: ScheduleEntity[];
}
