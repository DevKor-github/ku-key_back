import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class SelectCharacterLevelRequestDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({ description: '선택한 캐릭터 레벨' })
  selectedLevel: number;
}
