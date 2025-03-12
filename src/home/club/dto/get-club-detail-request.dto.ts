import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class GetClubDetailRequestDto {
  @IsNotEmpty()
  @ToBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: '로그인 여부' })
  isLogin: boolean;
}
