import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class SetProfileRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '본명' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '국적' })
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '모교' })
  homeUniversity: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '사용가능 언어' })
  language: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '전공' })
  major: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: '교환학생 시작 날짜', example: 'yyyy-mm-dd' })
  startDay: Date;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: '교환학생 끝 날짜', example: 'yyyy-mm-dd' })
  endDay: Date;
}
