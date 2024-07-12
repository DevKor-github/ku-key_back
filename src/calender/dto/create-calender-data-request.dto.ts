import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCalenderDataRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식이 잘못되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '날짜 (AAAA-BB-CC 형식)' })
  date: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '행사/일정 설명' })
  description: string;
}
