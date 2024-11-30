import { Controller, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NoticeService } from './notice.service';
import { Observable } from 'rxjs';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetNoticeResponseDto } from './dto/get-notice.dto';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { NoticeDocs } from 'src/decorators/docs/notice.decorator';

@Controller('notice')
@ApiTags('notice')
@ApiBearerAuth('accessToken')
@NoticeDocs
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @UseGuards(JwtAuthGuard)
  @Sse('/sse')
  sse(@User() user: AuthorizedUserDto): Observable<MessageEvent> {
    return this.noticeService.sendClientConnection(user.id);
  }

  @Sse('/sse/:userId')
  sseWithParam(@Param('userId') userId: number): Observable<any> {
    return this.noticeService.sendClientConnection(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotices(
    @User() user: AuthorizedUserDto,
    @Query() pageOption: CursorPageOptionsDto,
  ): Promise<GetNoticeResponseDto> {
    return await this.noticeService.getNotices(user, pageOption);
  }
}
