import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { TimeTableEntity } from './timetable.entity';

@Entity('schedule')
export class ScheduleEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  timeTableId: number;

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

  @JoinColumn({ name: 'timeTableId' })
  @ManyToOne(
    () => TimeTableEntity,
    (timeTableEntity) => timeTableEntity.schedules,
    {
      onDelete: 'CASCADE',
    },
  )
  timeTable: TimeTableEntity;
}
