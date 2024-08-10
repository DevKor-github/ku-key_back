import { ApiProperty } from '@nestjs/swagger';

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
