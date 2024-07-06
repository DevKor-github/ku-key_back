import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetFriendTimeTableRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '친구 추가용 ID' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '연도' })
  year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '학기' })
  semester: string;
}
