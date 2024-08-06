import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class GetMonthlyCalendarDataQueryDto {
  @IsInt()
  @IsNotEmpty()
  @Max(2030)
  @Min(2024)
  @ApiProperty({ description: '조회할 연도' })
  year: number;

  @IsInt()
  @IsNotEmpty()
  @Max(12)
  @Min(1)
  @ApiProperty({ description: '조회할 월' })
  month: number;
}

export class GetYearlyCalendarDataQueryDto {
  @IsInt()
  @IsNotEmpty()
  @Max(2030)
  @Min(2024)
  @ApiProperty({ description: '조회할 연도' })
  year: number;
}
