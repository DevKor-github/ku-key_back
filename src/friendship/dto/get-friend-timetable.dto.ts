import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetFriendTimetableRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '친구 ID' })
  friendId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '연도' })
  year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '학기' })
  semester: string;
}
