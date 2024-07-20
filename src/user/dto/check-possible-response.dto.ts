import { ApiProperty } from '@nestjs/swagger';

export class checkPossibleResponseDto {
  constructor(possible: boolean) {
    this.possible = possible;
  }

  @ApiProperty({ description: '사용 가능 여부' })
  possible: boolean;
}
