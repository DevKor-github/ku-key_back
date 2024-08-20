import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CursorPageOptionsDto {
  @ApiProperty({
    description: '한 페이지에 담을 데이터 수, default = 10',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number = 10;

  @ApiProperty({
    description: '커서 값, 14자리 숫자로 이루어진 문자열, 없으면 첫페이지',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
