import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { TimetableDto } from './dto/timetable.dto';
import { TimetableEntity } from 'src/entities/timetable.entity';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { DataSource, Repository } from 'typeorm';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { GetTimetableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { DayType } from './dto/get-courseinfo-timetable.dto';
import { CourseService } from 'src/course/course.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';
import { CreateTimetableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimetableResponseDto } from './dto/common-timetable-response.dto';
import { GetTimetableByTimetableIdDto } from './dto/get-timetable-timetable.dto';
import { ColorType } from './dto/update-timetable-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TimetableCourseEntity } from 'src/entities/timetable-course.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntity)
    private readonly timetableRepository: Repository<TimetableEntity>,
    @InjectRepository(TimetableCourseEntity)
    private readonly timetableCourseRepository: Repository<TimetableCourseEntity>,
    private readonly courseService: CourseService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ScheduleService))
    private readonly scheduleService: ScheduleService,
  ) {}

  // 시간표에 강의 추가 -> 강의랑 개인 스케쥴 둘 다 확인 필요
  async createTimetableCourse(
    timetableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<CreateTimetableCourseResponseDto> {
    const timetable = await this.timetableRepository.findOne({
      where: { id: timetableId, userId: user.id },
    });
    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    const course =
      await this.courseService.getCourseWithCourseDetails(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // TimetableCourse 테이블에 이미 동일한 레코드가 존재하는지 확인
    const existingTimetableCourse =
      await this.timetableCourseRepository.findOne({
        where: { timetableId, courseId },
      });
    if (existingTimetableCourse) {
      throw new ConflictException('Already exists in Timetable');
    }

    // 시간표에 존재하는 강의, 스케쥴과 추가하려는 강의가 시간이 겹치는 지 확인
    const isConflict = await this.checkTimeConflict(timetableId, courseId);

    if (isConflict) {
      throw new ConflictException(
        'Course conflicts with existing courses and schedules',
      );
    }

    const timetableCourse = this.timetableCourseRepository.create({
      timetableId,
      courseId,
      timetable,
      course,
    });

    return await this.timetableCourseRepository.save(timetableCourse);
  }

  async checkTimeConflict(
    timetableId: number,
    courseId: number,
  ): Promise<boolean> {
    // 강의시간 겹치는지 안겹치는지 확인
    const existingCourseInfo = await this.getTimetableCourseInfo(timetableId); //요일, 시작시간, 끝나는 시간 받아옴
    const newCourseInfo = await this.courseService.getCourseDetails(courseId);

    for (const newDetail of newCourseInfo) {
      for (const existingInfo of existingCourseInfo) {
        if (
          existingInfo.day === newDetail.day &&
          this.isConflictingTime(
            existingInfo.startTime,
            existingInfo.endTime,
            newDetail.startTime,
            newDetail.endTime,
          )
        ) {
          return true; // 겹치는 시간 존재
        }
      }
    }

    // 스케줄 시간 겹치는지 안겹치는지 확인
    const existingScheduleInfo =
      await this.getTimetableScheduleInfo(timetableId);
    for (const newDetail of newCourseInfo) {
      for (const existingInfo of existingScheduleInfo) {
        if (
          existingInfo.day === newDetail.day &&
          this.isConflictingTime(
            existingInfo.startTime,
            existingInfo.endTime,
            newDetail.startTime,
            newDetail.endTime,
          )
        ) {
          return true; // 겹치는 시간 존재
        }
      }
    }

    return false; // 겹치는 시간 없음
  }

  async getDaysAndTime(timetableId: number) {
    return await this.timetableCourseRepository
      .createQueryBuilder('ttc') //time_table_course
      .leftJoinAndSelect('ttc.course', 'course')
      .leftJoinAndSelect('course.courseDetails', 'courseDetail')
      .where('ttc.timetableId = :timetableId', { timetableId })
      .select([
        'courseDetail.day as day',
        'courseDetail.startTime as startTime',
        'courseDetail.endTime as endTime',
      ])
      .getRawMany();
  }
  async getTimetableCourseInfo(
    timetableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const daysAndTimes = await this.getDaysAndTime(timetableId);

    const result = daysAndTimes.map((obj) => ({
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
    }));

    return result;
  }

  async getTimetableScheduleInfo(
    timetableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const schedules =
      await this.scheduleService.getTimetableScheduleInfo(timetableId);

    return schedules.map((schedule) => ({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));
  }

  private isConflictingTime(
    existingStartTime: string,
    existingEndTime: string,
    newStartTime: string,
    newEndTime: string,
  ): boolean {
    // 문자열 시간을 숫자로 변환 (HH:MM:SS -> seconds)
    const timeToNumber = (time: string): number => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const existingStart = timeToNumber(existingStartTime);
    const existingEnd = timeToNumber(existingEndTime);
    const newStart = timeToNumber(newStartTime);
    const newEnd = timeToNumber(newEndTime);

    // 시간이 겹치는지 확인
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  }

  async createTimetable(
    createTimetableDto: CreateTimetableDto,
    user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 해당 user가 해당 년도, 해당 학기에 몇 개의 시간표를 가지고 있는 지 확인
      const existingTimetableNumber = await queryRunner.manager.count(
        TimetableEntity,
        {
          where: {
            userId: user.id,
            year: createTimetableDto.year,
            semester: createTimetableDto.semester,
          },
        },
      );

      if (existingTimetableNumber >= 3) {
        throw new ConflictException('Maximum number of Timetables reached');
      }

      const isFirstTimetable = existingTimetableNumber === 0; // 처음 생성하는 시간표인지 확인 (대표시간표가 될 예정)

      const newTimetable = queryRunner.manager.create(TimetableEntity, {
        userId: user.id,
        timetableName: createTimetableDto.timetableName,
        semester: createTimetableDto.semester,
        year: createTimetableDto.year,
        mainTimetable: isFirstTimetable,
      });

      await queryRunner.manager.save(newTimetable);
      await queryRunner.commitTransaction();
      return newTimetable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to create Timetable:', error);
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An internal error occurred');
      }
    } finally {
      await queryRunner.release();
    }
  }

  async getSimpleTimetableByTimetableId(
    timetableId: number,
    userId: number,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableRepository.findOne({
      where: { id: timetableId, userId },
    });
  }

  async getTimetableByTimetableId(
    timetableId: number,
    userId: number,
  ): Promise<GetTimetableByTimetableIdDto> {
    const timetable = await this.timetableRepository.findOne({
      where: { id: timetableId, userId },
      relations: [
        'timetableCourses',
        'timetableCourses.course',
        'timetableCourses.course.courseDetails',
      ],
    });
    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    const schedules =
      await this.scheduleService.getScheduleByTimetableId(timetableId);

    // 코스 정보와 스케줄 정보를 같은 깊이의 객체로 분리하여 반환
    const getTimetableByTimetableIdResponse: GetTimetableByTimetableIdDto = {
      courses: [],
      schedules: [],
      color: timetable.color,
      timetableName: timetable.timetableName,
    };
    timetable.timetableCourses.forEach((courseEntry) => {
      const {
        id: courseId,
        professorName,
        courseName,
        courseCode,
        syllabus,
      } = courseEntry.course;

      courseEntry.course.courseDetails.forEach((detailEntry) => {
        const { day, startTime, endTime, classroom } = detailEntry;

        // 강의 정보 객체
        getTimetableByTimetableIdResponse.courses.push({
          courseId,
          professorName,
          courseName,
          courseCode,
          syllabus,
          day: day as DayType,
          startTime,
          endTime,
          classroom,
        });
      });
    });

    // 스케줄 정보 객체
    schedules.forEach((schedule) => {
      getTimetableByTimetableIdResponse.schedules.push({
        scheduleId: schedule.id,
        scheduleTitle: schedule.title,
        scheduleDay: schedule.day as DayType,
        scheduleStartTime: schedule.startTime,
        scheduleEndTime: schedule.endTime,
        location: schedule.location,
      });
    });

    return getTimetableByTimetableIdResponse;
  }

  async getTimetableByUserId(
    userId: number,
  ): Promise<GetTimetableByUserIdResponseDto[]> {
    const userTimetable = await this.timetableRepository.find({
      where: { userId },
    });
    if (!userTimetable) throw new NotFoundException('Timetable not found');
    return userTimetable.map((table) => ({
      timetableId: table.id,
      semester: table.semester,
      year: table.year,
      mainTimetable: table.mainTimetable,
      timetableName: table.timetableName,
    }));
  }

  // 친구 시간표 조회
  async getFriendTimetable(
    friendId: number,
    semester: string,
    year: string,
  ): Promise<GetTimetableByTimetableIdDto> {
    const timetable = await this.timetableRepository.findOne({
      where: {
        userId: friendId,
        year,
        semester,
        mainTimetable: true,
      },
    });

    // 시간표가 없을 경우
    if (!timetable) {
      throw new NotFoundException('친구 시간표가 존재하지 않습니다!');
    }

    // 시간표 id 추출 후 구현해놓은 함수 사용
    const friendTimetableId = timetable.id;
    return await this.getTimetableByTimetableId(friendTimetableId, friendId);
  }

  // 시간표에 등록한 강의 삭제
  async deleteTimetableCourse(
    timetableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    // 해당 유저가 만든 시간표인지 확인
    const timetable = await this.timetableRepository.findOne({
      where: { id: timetableId, userId: user.id },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    const timetableCourse = await this.timetableCourseRepository.findOne({
      where: { timetableId, courseId },
    });
    if (!timetableCourse) {
      throw new NotFoundException('There is no course in this timetable!');
    }

    await this.timetableCourseRepository.softDelete({
      timetableId,
      courseId,
    });

    return { deleted: true };
  }

  async deleteTimetable(
    timetableId: number,
    user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const timetable = await queryRunner.manager.findOne(TimetableEntity, {
        where: { id: timetableId, userId: user.id },
        relations: ['timetableCourses', 'schedules'], // soft-remove cascade 조건을 위해 추가
      });

      if (!timetable) {
        throw new NotFoundException('Timetable not found');
      }

      if (timetable.mainTimetable) {
        const nextMainTimetable = await queryRunner.manager.findOne(
          TimetableEntity,
          {
            where: {
              userId: user.id,
              year: timetable.year,
              semester: timetable.semester,
              mainTimetable: false,
            },
            order: { createdAt: 'ASC' },
          },
        );

        if (nextMainTimetable) {
          nextMainTimetable.mainTimetable = true;
          await queryRunner.manager.save(nextMainTimetable);
        }
      }
      await queryRunner.manager.softRemove(timetable);
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to delete Timetable: ', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMainTimetable(
    timetableDto: TimetableDto,
    user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    const mainTimetable = await this.timetableRepository.findOne({
      where: {
        userId: user.id,
        mainTimetable: true,
        year: timetableDto.year,
        semester: timetableDto.semester,
      },
    });

    if (!mainTimetable) {
      throw new NotFoundException('MainTimetable not found');
    }
    return mainTimetable;
  }

  // 시간표 색상 변경
  async updateTimetableColor(
    timetableId: number,
    user: AuthorizedUserDto,
    timetableColor: ColorType,
  ): Promise<CommonTimetableResponseDto> {
    const timetable = await this.timetableRepository.findOne({
      where: {
        id: timetableId,
        userId: user.id,
      },
    });
    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    timetable.color = timetableColor;
    return await this.timetableRepository.save(timetable);
  }

  // 시간표 이름 변경
  async updateTimetableName(
    timetableId: number,
    user: AuthorizedUserDto,
    timetableName: string,
  ): Promise<CommonTimetableResponseDto> {
    const timetable = await this.timetableRepository.findOne({
      where: {
        id: timetableId,
        userId: user.id,
      },
    });
    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    timetable.timetableName = timetableName;
    return await this.timetableRepository.save(timetable);
  }

  // 기존의 대표시간표의 mainTimetable column을 false로 변경하고, 새로운 시간표의 mainTimetable column을 true로 변경
  async updateMainTimetable(
    timetableId: number,
    user: AuthorizedUserDto,
    timetableDto: TimetableDto,
  ): Promise<CommonTimetableResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const oldMainTimetable = await queryRunner.manager.findOne(
        TimetableEntity,
        {
          where: {
            userId: user.id,
            year: timetableDto.year,
            semester: timetableDto.semester,
            mainTimetable: true,
          },
        },
      );
      const newMainTimetable = await queryRunner.manager.findOne(
        TimetableEntity,
        {
          where: {
            id: timetableId,
            userId: user.id,
            year: timetableDto.year,
            semester: timetableDto.semester,
          },
        },
      );
      if (!newMainTimetable || !oldMainTimetable) {
        throw new NotFoundException('Timetable not found');
      } else if (oldMainTimetable.id === newMainTimetable.id) {
        throw new ConflictException('Already main Timetable');
      }

      oldMainTimetable.mainTimetable = false;
      newMainTimetable.mainTimetable = true;
      await queryRunner.manager.save(oldMainTimetable);
      await queryRunner.manager.save(newMainTimetable);
      await queryRunner.commitTransaction();

      return newMainTimetable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
