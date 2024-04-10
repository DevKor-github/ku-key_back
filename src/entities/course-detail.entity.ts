import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CourseEntity } from './course.entity';

@Entity('course_detail')
export class CourseDetailEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar',{nullable:false})
  day: string;
  
  @Column({ type: 'time' })
  private _startTime: string;
  
  @Column('time',{nullable:false})
  private _endTime : string;

  @Column('varchar',{nullable:false})
  classroom : string;

  // mysql time type은 시:분:초 형태라 입력받을때 시:분만 받고 내부적으로는 초까지 받아서 저장하는 로직
  set startTime(value: string) {
    this._startTime = `${value}:00`;
  }

  get startTime(): string {
    return this._startTime.substring(0, 5); // HH:MM:SS 에서 0~4번 인덱스까지
  }

  set endTime(value: string) {
    this.endTime = `${value}:00`;
  }

  get endTime(): string {
    return this._endTime.substring(0, 5); // HH:MM:SS 에서 0~4번 인덱스까지
  }

  @ManyToOne(()=>CourseEntity, courseEntity => courseEntity.courseDetail)
  course: CourseEntity;
}
