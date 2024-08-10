import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from 'src/entities/calendar.entity';

class AcademicSchedule {
  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;

  @ApiProperty({ description: '시작 날짜' })
  startDate: Date;

  @ApiProperty({ description: '시작 요일' })
  startDay: number;

  @ApiProperty({ description: '종료 날짜' })
  endDate: Date;

  @ApiProperty({ description: '종료 요일' })
  endDay: number;

  constructor(calendar: CalendarEntity) {
    this.title = calendar.title;
    this.description = calendar.description;
    this.startDate = calendar.startDate;
    this.startDay = this.startDate.getDay();
    this.endDate = calendar.endDate;
    this.endDay = this.endDate.getDay();
  }
}

export class GetAcademicScheduleDataResponseDto {
  @ApiProperty({ description: '월' })
  month: number;

  @ApiProperty({
    description: '월별 Academic Schedule 행사/일정',
    type: [AcademicSchedule],
  })
  schedules: AcademicSchedule[];

  constructor(month: number, schedules: AcademicSchedule[]) {
    this.month = month;
    this.schedules = schedules;
  }
}
