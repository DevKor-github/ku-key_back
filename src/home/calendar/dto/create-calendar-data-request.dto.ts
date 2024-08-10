import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCalendarDataRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식이 잘못되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '시작 날짜 (AAAA-BB-CC 형식)' })
  startDate: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식이 잘못되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '종료 날짜 (AAAA-BB-CC 형식)' })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '행사/일정 설명' })
  description: string;
}
