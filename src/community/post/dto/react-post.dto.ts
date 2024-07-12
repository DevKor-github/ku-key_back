import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

const Reaction = {
  good: 0,
  sad: 1,
  amazing: 2,
  angry: 3,
  funny: 4,
} as const;

export type Reaction = (typeof Reaction)[keyof typeof Reaction];

export class ReactPostRequestDto {
  @IsNotEmpty()
  @IsEnum(Reaction)
  @ApiProperty({ description: '남길 반응 종류', enum: Reaction })
  reaction: Reaction;
}

export class ReactPostResponseDto {
  constructor(isReacted: Reaction) {
    this.isReacted = isReacted;
  }

  @ApiProperty({ description: '남겨진 반응 종류' })
  isReacted: Reaction;
}
