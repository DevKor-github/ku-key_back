import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Language } from 'src/enums/language';

export class LanguageRequestDto {
  @ApiProperty({ description: '추가/삭제하고자 하는 언어', enum: Language })
  @IsEnum(Language)
  language: Language;
}

export class LanguageResponseDto {
  @ApiProperty({
    description: '추가/삭제 후 언어 목록',
    isArray: true,
    enum: Language,
  })
  languages: Language[];
}
