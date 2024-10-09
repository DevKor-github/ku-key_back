import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetResponseDto } from './dto/set-response.dto';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { DeleteUserResponseDto } from './dto/delete-user.dto';
import { PurchaseItemRequestDto } from './dto/purchase-item-request.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { PointService } from './point.service';
import { PurchaseItemResponseDto } from './dto/purchase-item-response-dto';
import {
  LanguageRequestDto,
  LanguageResponseDto,
} from './dto/user-language.dto';
import { CheckCourseReviewReadingTicketResponseDto } from './dto/check-course-review-reading-ticket.dto';
import { SelectCharacterLevelRequestDto } from './dto/select-character-level-request.dto';
import { SelectCharacterLevelResponseDto } from './dto/select-character-level-response-dto';
import { UserDocs } from 'src/decorators/docs/user.decorator';

@ApiTags('User')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@UserDocs
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pointService: PointService,
  ) {}

  @Patch('/profile')
  async setProfile(
    @Body() profileDto: SetProfileRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
  }

  @Patch('/exchange-day')
  async setExchangeDay(
    @Body() requestDto: SetExchangeDayReqeustDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setExchangeDay(id, requestDto);
  }

  @Get('/profile')
  async getProfile(
    @User() user: AuthorizedUserDto,
  ): Promise<GetProfileResponseDto> {
    const id = user.id;
    return await this.userService.getProfile(id);
  }

  @Post('/language')
  async appendLanguage(
    @Body() requestDto: LanguageRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<LanguageResponseDto> {
    const id = user.id;
    return await this.userService.appendLanguage(id, requestDto.language);
  }

  @Delete('/language')
  async deleteLanguage(
    @Body() requestDto: LanguageRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<LanguageResponseDto> {
    const id = user.id;
    return await this.userService.deleteLanguage(id, requestDto.language);
  }

  @Get('point-history')
  async getPointHistory(
    @User() user: AuthorizedUserDto,
  ): Promise<GetPointHistoryResponseDto[]> {
    return await this.pointService.getPointHistory(user);
  }

  @UseInterceptors(TransactionInterceptor)
  @Post('purchase-item')
  async purchaseItem(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() requestDto: PurchaseItemRequestDto,
  ): Promise<PurchaseItemResponseDto> {
    return await this.pointService.purchaseItem(
      transactionManager,
      user.id,
      requestDto,
    );
  }

  @Get('course-review-reading-ticket')
  async checkCourseReviewReadingTicket(
    @User() user: AuthorizedUserDto,
  ): Promise<CheckCourseReviewReadingTicketResponseDto> {
    return await this.userService.checkCourseReviewReadingTicket(user.id);
  }

  @Patch('character-level')
  async selectCharacterLevel(
    @User() user: AuthorizedUserDto,
    @Body() body: SelectCharacterLevelRequestDto,
  ): Promise<SelectCharacterLevelResponseDto> {
    return await this.userService.selectCharacterLevel(user.id, body);
  }

  @Delete()
  async deleteUser(
    @User() user: AuthorizedUserDto,
  ): Promise<DeleteUserResponseDto> {
    return this.userService.softDeleteUser(user.id);
  }
}
