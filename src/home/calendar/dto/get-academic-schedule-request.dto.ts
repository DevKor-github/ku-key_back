import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class GetAcademicScheduleDataRequestDto {
  @IsInt()
  @IsNotEmpty()
  @Max(2030)
  @Min(2024)
  @ApiProperty({ description: '조회할 연도' })
  year: number;

  @IsInt()
  @IsNotEmpty()
  @Max(2)
  @Min(1)
  @ApiProperty({ description: '조회할 학기' })
  semester: number;
}
