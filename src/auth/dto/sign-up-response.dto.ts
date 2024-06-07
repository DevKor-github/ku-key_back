import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  constructor(sended: boolean, studentNumber: number) {
    this.sended = sended;
    this.studentNumber = studentNumber;
  }

  @ApiProperty({ description: '학교인증요청 성공 여부' })
  sended: boolean;

  @ApiProperty({ description: '인증요청한 학번' })
  studentNumber: number;
}
