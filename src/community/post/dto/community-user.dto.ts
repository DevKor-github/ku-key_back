import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/entities/user.entity';

export class CommunityUser {
  constructor(
    user: UserEntity,
    isAnonymous: boolean,
    anonymousNumber?: number,
  ) {
    if (user == null || user.deletedAt) {
      this.username = 'Deleted';
      this.profileImgUrl = '삭제된 사용자 이미지링크';
    } else {
      this.profileImgUrl = user.profileImageDir;
      if (!isAnonymous)
        this.username =
          user.username.substring(0, Math.floor(user.username.length / 2)) +
          '*'.repeat(
            user.username.length - Math.floor(user.username.length / 2),
          );
      else if (anonymousNumber === 0) this.username = 'Author';
      else if (!anonymousNumber) this.username = 'Anonymous';
      else this.username = `Anonymous ${anonymousNumber}`;
    }
  }
  @ApiProperty({
    description: '사용자, 익명이면 "Anonymous", 탈퇴했으면 "Deleted"',
  })
  username: string;

  @ApiProperty({ description: '프로필 사진 링크' })
  profileImgUrl: string;
}
