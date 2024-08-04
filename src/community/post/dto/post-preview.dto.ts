import { ApiProperty } from '@nestjs/swagger';
import { CommunityUser } from './community-user.dto';
import { ReactionCount } from './get-post.dto';
import { PostEntity } from 'src/entities/post.entity';

export class PostPreview {
  constructor(postEntity: PostEntity) {
    this.id = postEntity.id;
    this.title = postEntity.title;
    this.content = postEntity.content.substring(0, 100);
    this.createdAt = postEntity.createdAt;
    this.user = new CommunityUser(postEntity.user, postEntity.isAnonymous);
    this.commentCount = postEntity.commentCount;
    this.scrapCount = postEntity.scrapCount;
    this.thumbnailDir =
      postEntity.postImages.length > 0 ? postEntity.postImages[0].imgDir : null;
    this.reaction = new ReactionCount();
    this.reaction.good = postEntity.goodReactionCount;
    this.reaction.sad = postEntity.sadReactionCount;
    this.reaction.amazing = postEntity.amazingReactionCount;
    this.reaction.angry = postEntity.angryReactionCount;
    this.reaction.funny = postEntity.funnyReactionCount;
  }

  @ApiProperty({ description: '게시글 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용(100글자 까지)' })
  content: string;

  @ApiProperty({ description: '게시글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '게시글을 생성한 사용자' })
  user: CommunityUser;

  @ApiProperty({ description: '댓글 수' })
  commentCount: number;

  @ApiProperty({ description: '스크랩 수' })
  scrapCount: number;

  @ApiProperty({ description: '사진 미리보기(사진이 없으면 null)' })
  thumbnailDir: string | null;

  @ApiProperty({ description: '반응' })
  reaction: ReactionCount;
}

export class PostPreviewWithBoardName extends PostPreview {
  constructor(postEntity: PostEntity) {
    super(postEntity);
    this.boardName = postEntity.board.name;
  }

  @ApiProperty({ description: '게시판 이름' })
  boardName: string;
}
