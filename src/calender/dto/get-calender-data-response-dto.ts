import { ApiProperty } from '@nestjs/swagger';

export class GetCalenderDataResponseDto {
  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;
}
