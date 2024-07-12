import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { TimetableEntity } from './timetable.entity';

@Entity('schedule')
export class ScheduleEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  timetableId: number;

  @Column('varchar', { nullable: false })
  title: string;

  @Column('varchar', { nullable: false })
  day: string;

  @Column('time', { nullable: false })
  startTime: string;

  @Column('time', { nullable: false })
  endTime: string;

  @Column('varchar', { nullable: true })
  location: string;

  @JoinColumn({ name: 'timetableId' })
  @ManyToOne(
    () => TimetableEntity,
    (timetableEntity) => timetableEntity.schedules,
    {
      onDelete: 'CASCADE',
    },
  )
  timetable: TimetableEntity;
}
