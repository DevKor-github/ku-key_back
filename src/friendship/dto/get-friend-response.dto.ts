import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetFriendResponseDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'freindship table의 PK' })
  friendshipId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'user table의 PK' })
  userId: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '본명' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '친구 추가용 아이디' })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '전공' })
  major: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '출신 나라' })
  country: string;
}
