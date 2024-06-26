import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetTimeTableByUserIdResponseDto {
  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timeTableId: number;

  @ApiProperty({ description: '학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '연도' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: '대표 시간표 여부' })
  @IsBoolean()
  @IsNotEmpty()
  mainTimeTable: boolean;

  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  tableName: string;
}
