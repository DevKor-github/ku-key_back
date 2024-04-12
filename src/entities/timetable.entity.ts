import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('time_table')
export class TimeTableEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({nullable:false})
  userId: number;

  @Column('varchar',{nullable:false})
  tableName: string;

  @Column('varchar',{nullable:false})
  semester: string;

  @Column('varchar', {nullable:false})
  year: string;

  @JoinColumn({name: 'userId'})
  @ManyToOne(()=>UserEntity, userEntity => userEntity.timeTable,{
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
