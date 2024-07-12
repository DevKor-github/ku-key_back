import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetCalenderDataQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식이 잘못되었습니다.',
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '조회할 날짜 (AAAA-BB-CC 형식)' })
  date: string;
}
