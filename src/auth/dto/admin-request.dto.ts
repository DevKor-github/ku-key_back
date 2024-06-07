import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Admin 아이디' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Admin 비밀번호' })
  password: string;
}
