import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class GetClubDetailRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'club id' })
  clubId: number;

  @IsNotEmpty()
  @ToBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: '로그인 여부' })
  isLogin: boolean;
}
