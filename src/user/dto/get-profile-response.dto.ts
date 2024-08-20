import { ApiProperty } from '@nestjs/swagger';
import { CharacterEntity } from 'src/entities/character.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CharacterType } from 'src/enums/character-type.enum';

export class GetProfileResponseDto {
  @ApiProperty({ description: '본명' })
  name: string;

  @ApiProperty({ description: '국적' })
  country: string;

  @ApiProperty({ description: '모교' })
  homeUniversity: string;

  @ApiProperty({ description: '전공' })
  major: string;

  @ApiProperty({ description: '교환학생 시작 날짜', example: 'yyyy-mm-dd' })
  startDay: Date;

  @ApiProperty({ description: '교환학생 끝 날짜', example: 'yyyy-mm-dd' })
  endDay: Date;

  @ApiProperty({ description: '사용 가능한 포인트' })
  point: number;

  @ApiProperty({ description: '캐릭터 레벨' })
  level: number;

  @ApiProperty({ description: '캐릭터 타입' })
  type: CharacterType;

  constructor(user: UserEntity, character: CharacterEntity) {
    this.name = user.name;
    this.country = user.country;
    this.homeUniversity = user.homeUniversity;
    this.major = user.major;
    this.startDay = user.startDay;
    this.endDay = user.endDay;
    this.point = user.point;
    this.level = character.level;
    this.type = character.type;
  }
}
