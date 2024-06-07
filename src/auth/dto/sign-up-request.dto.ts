import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateUserRequestDto } from 'src/user/dto/create-user-request.dto';

export class SignUpRequestDto extends CreateUserRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '중복확인 완료된 학번' })
  studentNumber: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '교환학생 합격 스크린샷 파일',
  })
  screenshot: any;
}
