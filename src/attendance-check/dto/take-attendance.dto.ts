import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TakeAttendanceRequestDto {
  @ApiProperty({
    description: '당일 날짜 (YYYY-MM-DD)',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  @IsString()
  @IsNotEmpty()
  attendanceDate: string;
}

export class TakeAttendanceResponseDto {
  @ApiProperty({ description: '출석자 ID' })
  userId: number;

  @ApiProperty({ description: '출석 날짜' })
  attendanceDate: string;

  @ApiProperty({ description: '출석 성공 여부' })
  success: boolean;

  constructor(userId: number, attendanceDate: string, success: boolean) {
    this.userId = userId;
    this.attendanceDate = attendanceDate;
    this.success = success;
  }
}
