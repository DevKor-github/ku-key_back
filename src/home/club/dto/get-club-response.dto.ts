import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetClubResponseDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'club table의 PK' })
  clubId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '동아리명' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '동아리 요약' })
  summary: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '정기 모임' })
  regularMeeting: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '모집 기간' })
  recruitmentPeriod: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '동아리 설명' })
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: '찜 여부' })
  isLiked: boolean;
}
