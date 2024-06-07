import { ApiProperty } from '@nestjs/swagger';

export class GetScreenshotVerificationsResponseDto {
  @ApiProperty({ description: '인증요청 고유 Id' })
  id: number;

  @ApiProperty({ description: '교환학생 합격 스크린샷 이미지 url' })
  imgDir: string;

  @ApiProperty({ description: '인증 요청한 학번' })
  studentNumber: number;

  @ApiProperty({ description: '요청한 날짜 및 시간' })
  lastUpdated: Date;
}
