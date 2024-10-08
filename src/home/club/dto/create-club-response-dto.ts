import { PickType } from '@nestjs/swagger';
import { GetClubResponseDto } from './get-club-response.dto';
import { ClubEntity } from 'src/entities/club.entity';

export class CreateClubResponseDto extends PickType(GetClubResponseDto, [
  'clubId',
  'name',
  'summary',
  'regularMeeting',
  'recruitmentPeriod',
  'description',
  'imageUrl',
  'instagramLink',
  'youtubeLink',
]) {
  constructor(club: ClubEntity) {
    super();
    this.clubId = club.id;
    this.name = club.name;
    this.summary = club.summary;
    this.regularMeeting = club.regularMeeting;
    this.recruitmentPeriod = club.recruitmentPeriod;
    this.description = club.description;
    this.imageUrl = club.imageUrl;
    this.instagramLink = club.instagramLink;
    this.youtubeLink = club.youtubeLink;
  }
}
