import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CommonDeleteResponseDto {
  @ApiProperty({ description: '삭제 여부' })
  @IsNotEmpty()
  @IsBoolean()
  deleted: boolean;
}
