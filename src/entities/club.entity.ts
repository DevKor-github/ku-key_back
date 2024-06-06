import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

export class ClubEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  activity: string;

  @Column({ type: 'varchar', nullable: false })
  activityPeriod: string;

  @Column({ type: 'varchar', nullable: false })
  recruitmentInfo: string;

  @Column({ type: 'varchar', nullable: false })
  joinMethod: string;

  @Column({ type: 'varchar', nullable: true })
  requiredSemester: boolean;

  @Column({ type: 'varchar', nullable: true })
  instagram: string;

  @Column({ type: 'varchar', nullable: true })
  contactInfo: string;
}
