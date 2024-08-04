import { Controller, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NoticeService } from './notice.service';
import { Observable } from 'rxjs';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetNoticeResponseDto } from './dto/get-notice.dto';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { CursorPageResponseDto } from 'src/common/dto/CursorPageResponse.dto';

@Controller('notice')
@ApiTags('notice')
@ApiBearerAuth('accessToken')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '알림 연결',
    description: 'SSE를 통해 서버에서 넘겨주는 알림을 연결합니다.',
  })
  @Sse('/sse')
  sse(@User() user: AuthorizedUserDto): Observable<MessageEvent> {
    return this.noticeService.sendClientConnection(user.id);
  }

  @ApiOperation({
    summary: '알림 연결',
    description:
      'SSE를 통해 서버에서 넘겨주는 알림을 연결합니다. (access토큰 만료됨에 따라 연결이 끊길 경우 사용)',
  })
  @Sse('/sse/:userId')
  sseWithParam(@Param('userId') userId: number): Observable<any> {
    return this.noticeService.sendClientConnection(userId);
  }

  @ApiOperation({
    summary: '알림 조회',
    description:
      '받았던 알림들을 조회합니다. 커뮤니티 관련 알림일 경우 해당 게시글의 Id를 함께 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 조회 성공',
    type: CursorPageResponseDto<GetNoticeResponseDto>,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotices(
    @User() user: AuthorizedUserDto,
    @Query() pageOption: CursorPageOptionsDto,
  ): Promise<CursorPageResponseDto<GetNoticeResponseDto>> {
    return await this.noticeService.getNotices(user, pageOption);
  }
}
