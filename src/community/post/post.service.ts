import { BadRequestException, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostImageRepository } from './post-image.repository';
import { BoardService } from '../board/board.service';
import { GetPostListResponseDto } from './dto/get-post-list.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postImageRepository: PostImageRepository,
    private readonly boardService: BoardService,
  ) {}

  async getPostList(boardId: number): Promise<GetPostListResponseDto> {
    const board = await this.boardService.getBoardbyId(boardId);
    if (!board) {
      throw new BadRequestException('Wrong BoardId!');
    }
    const posts = await this.postRepository.getPostsbyBoardId(boardId);
    return new GetPostListResponseDto(board, posts);
  }
}
