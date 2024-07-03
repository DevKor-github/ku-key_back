import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const Status = {
  Me: 'me',
  Friend: 'friend',
  Requested: 'requested',
  Pending: 'pending',
  Unknown: 'unknown',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export class SearchUserResponseDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '본명' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '친구 추가용 id' })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '전공' })
  major: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '사용 언어' })
  language: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Status)
  @ApiProperty({
    description:
      '유저 상태 (본인 / 친구 / 상대방의 수락 대기 중 / 나의 수락 보류 중 / 그 외)',
  })
  status: Status;
}
