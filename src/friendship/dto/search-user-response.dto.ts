import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
