import { IsBoolean, IsNotEmpty } from 'class-validator';
import { CreatePostRequestDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostRequestDto extends CreatePostRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '첨부 이미지 변경 여부' })
  imageUpdate: boolean;
}
