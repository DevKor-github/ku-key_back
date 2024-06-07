import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '변경하고자 하는 비밀번호' })
  newPassword: string;
}
