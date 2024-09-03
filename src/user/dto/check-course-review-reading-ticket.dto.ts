import { ApiProperty } from '@nestjs/swagger';

export class CheckCourseReviewReadingTicketResponseDto {
  constructor(date: Date) {
    this.date = date;
  }

  @ApiProperty({ description: '강의평 열람권 만료 일자' })
  date: Date;
}
