import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarDataResponseDto {
  @ApiProperty({ description: '행사/일정 id' })
  id: number;

  @ApiProperty({ description: '날짜 (AAAA-BB-CC 형식)' })
  date: Date;

  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;
}
