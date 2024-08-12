import { IsNotEmpty } from 'class-validator';
import { CreatePostRequestDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class UpdatePostRequestDto extends CreatePostRequestDto {
  @IsNotEmpty()
  @ToBoolean()
  @ApiProperty({ description: '첨부 이미지 변경 여부' })
  imageUpdate: boolean;
}
