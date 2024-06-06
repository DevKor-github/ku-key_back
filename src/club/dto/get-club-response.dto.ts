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
  @ApiProperty({ description: '활동 내용' })
  activity: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: '찜 여부' })
  isLiked: boolean;
}
