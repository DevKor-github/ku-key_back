import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty({ description: '기기 코드' })
  @IsNotEmpty()
  @IsString()
  deviceCode: string;
}
