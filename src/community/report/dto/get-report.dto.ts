import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from 'src/entities/comment.entity';
import { PostEntity } from 'src/entities/post.entity';
import { ReportEntity } from 'src/entities/report.entity';
import { UserEntity } from 'src/entities/user.entity';

class ReportedUser {
  constructor(userEntity: UserEntity) {
    this.id = userEntity.id;
    this.username = userEntity.username;
  }
  @ApiProperty({ description: '사용자 고유 ID' })
  id: number;

  @ApiProperty({ description: '사용자 username' })
  username: string;
}

class ReportedPost {
  constructor(postEntity: PostEntity) {
    this.id = postEntity.id;
    this.title = postEntity.title;
    this.content = postEntity.content;
    this.imgDirs = postEntity.postImages.map((postImage) => postImage.imgDir);
  }
  @ApiProperty({ description: '게시글 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @ApiProperty({ description: '게시글 첨부 이미지' })
  imgDirs: string[];
}

class ReportedComment {
  constructor(commentEntity: CommentEntity) {
    this.id = commentEntity.id;
    this.content = commentEntity.content;
  }
  @ApiProperty({ description: '댓글 고유 ID' })
  id: number;

  @ApiProperty({ description: '댓글 내용' })
  content: string;
}

export class GetReportResponseDto {
  constructor(reportEntity: ReportEntity, count: number) {
    if (!reportEntity.commentId) {
      this.reportedPost = new ReportedPost(reportEntity.post);
      this.reportedUser = new ReportedUser(reportEntity.post.user);
    } else {
      this.reportedComment = new ReportedComment(reportEntity.comment);
      this.reportedUser = new ReportedUser(reportEntity.comment.user);
    }
    this.reportCount = count;
  }
  @ApiProperty({ description: '신고된 게시글' })
  reportedPost?: ReportedPost;

  @ApiProperty({ description: '신고된 댓글' })
  reportedComment?: ReportedComment;

  @ApiProperty({ description: '해당 글에 접수된 신고 횟수' })
  reportCount: number;

  @ApiProperty({ description: '신고된 사용자' })
  reportedUser: ReportedUser;
}
