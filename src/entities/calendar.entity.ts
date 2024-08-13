import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('calendar')
export class CalendarEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('timestamp', { nullable: false })
  startDate: Date;

  @Column('timestamp', { nullable: false })
  endDate: Date;

  @Column('varchar', { nullable: false })
  title: string;

  @Column('varchar', { nullable: false })
  description: string;

  @Column('boolean', { nullable: false, default: false })
  isAcademic: boolean;
}
