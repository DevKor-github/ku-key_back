import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { TimetableDto } from './dto/timetable.dto';
import { TimetableEntity } from 'src/entities/timetable.entity';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { EntityManager, Repository } from 'typeorm';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { GetTimetableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { CourseService } from 'src/course/course.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';
import { CreateTimetableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimetableResponseDto } from './dto/common-timetable-response.dto';
import { GetTimetableByTimetableIdDto } from './dto/get-timetable-timetable.dto';
import { ColorType } from './dto/update-timetable-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TimetableCourseEntity } from 'src/entities/timetable-course.entity';
import { isConflictingTime } from 'src/utils/time-utils';
import { DayType } from 'src/common/types/day-type.utils';
import { throwKukeyException } from 'src/utils/exception.util';
import { DeleteTimetableResponseDto } from './dto/delete-timetable-response.dto';
import { GetTodayTimetableResponse } from './dto/get-today-timetable-response.dto';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntity)
    private readonly timetableRepository: Repository<TimetableEntity>,
    @InjectRepository(TimetableCourseEntity)
    private readonly timetableCourseRepository: Repository<TimetableCourseEntity>,
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => ScheduleService))
    private readonly scheduleService: ScheduleService,
  ) {}

  async createTimetableCourse(
    timetableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<CreateTimetableCourseResponseDto> {
    const timetable = await this.timetableRepository.findOne({
      where: { id: timetableId, userId: user.id },
    });
    if (!timetable) {
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    const course =
      await this.courseService.getCourseWithCourseDetails(courseId);

    if (!course) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    // 시간표의 학기와 강의의 학기가 일치하는지 확인
    if (
      timetable.year !== course.year ||
      timetable.semester !== course.semester
    ) {
      throwKukeyException('TIMETABLE_COURSE_MISMATCH');
    }

    // TimetableCourse 테이블에 이미 동일한 과목이 존재하는지 확인 (학수번호 체크)
    const existingTimetableCourse = await this.timetableCourseRepository.find({
      where: { timetableId },
      relations: {
        course: true,
      },
    });

    // 같은 학수번호의 과목이 존재하는지 확인
    const splitedCourseCode = course.courseCode.slice(0, 7); // 추가하려는 강의 학수번호 앞 7자리
    const existingCourseCodes = existingTimetableCourse.map((timetableCourse) =>
      timetableCourse.course.courseCode.slice(0, 7),
    );
    for (const courseCode of existingCourseCodes) {
      if (courseCode === splitedCourseCode) {
        throwKukeyException('COURSE_ALREADY_EXIST');
      }
    }

    // 시간표에 존재하는 강의, 스케쥴과 추가하려는 강의가 시간이 겹치는 지 확인
    const isConflict = await this.checkTimeConflict(timetableId, courseId);

    if (isConflict) {
      throwKukeyException('COURSE_CONFLICT');
    }

    const timetableCourse = this.timetableCourseRepository.create({
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
          isConflictingTime(
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
          isConflictingTime(
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

  async createTimetable(
    transactionManager: EntityManager,
    createTimetableDto: CreateTimetableDto,
    user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    // 해당 user가 해당 년도, 해당 학기에 몇 개의 시간표를 가지고 있는 지 확인
    const existingTimetableNumber = await transactionManager.count(
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
      throwKukeyException('TIMETABLE_LIMIT_EXCEEDED');
    }

    const isFirstTimetable = existingTimetableNumber === 0; // 처음 생성하는 시간표인지 확인 (대표시간표가 될 예정)

    const newTimetable = transactionManager.create(TimetableEntity, {
      userId: user.id,
      timetableName: createTimetableDto.timetableName,
      semester: createTimetableDto.semester,
      year: createTimetableDto.year,
      mainTimetable: isFirstTimetable,
    });

    await transactionManager.save(newTimetable);
    return newTimetable;
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
      throwKukeyException('TIMETABLE_NOT_FOUND');
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
    for (const courseEntry of timetable.timetableCourses) {
      const {
        id: courseId,
        professorName,
        courseName,
        courseCode,
        syllabus,
      } = courseEntry.course;

      if (
        !courseEntry.course.courseDetails ||
        courseEntry.course.courseDetails.length === 0
      ) {
        getTimetableByTimetableIdResponse.courses.push({
          courseId,
          professorName,
          courseName,
          courseCode,
          syllabus,
          day: null,
          startTime: null,
          endTime: null,
          classroom: null,
        });
        continue;
      }

      for (const detailEntry of courseEntry.course.courseDetails) {
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
      }
    }

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
    if (!userTimetable) throwKukeyException('TIMETABLE_NOT_FOUND');
    return userTimetable.map(
      (table) => new GetTimetableByUserIdResponseDto(table),
    );
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
      throwKukeyException('TIMETABLE_NOT_FOUND');
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
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    const timetableCourse = await this.timetableCourseRepository.findOne({
      where: { timetableId, courseId },
    });
    if (!timetableCourse) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    await this.timetableCourseRepository.softDelete({
      timetableId,
      courseId,
    });

    return new CommonDeleteResponseDto(true);
  }

  async deleteTimetable(
    transactionManager: EntityManager,
    timetableId: number,
    user: AuthorizedUserDto,
  ): Promise<DeleteTimetableResponseDto> {
    const timetable = await transactionManager.findOne(TimetableEntity, {
      where: { id: timetableId, userId: user.id },
      relations: ['timetableCourses', 'schedules'], // soft-remove cascade 조건을 위해 추가
    });

    if (!timetable) {
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    if (timetable.mainTimetable) {
      const nextMainTimetable = await transactionManager.findOne(
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
        await transactionManager.update(TimetableEntity, nextMainTimetable.id, {
          mainTimetable: true,
        });
      }
    }
    await transactionManager.softRemove(timetable);

    // 삭제 후에 해당 학기에 시간표가 하나도 존재하지 않으면 추가로 하나 생성 (그 시간표가 대표시간표)
    const remainingTimetable = await transactionManager.findOne(
      TimetableEntity,
      {
        where: {
          userId: user.id,
          semester: timetable.semester,
          year: timetable.year,
        },
      },
    );

    if (!remainingTimetable) {
      const newTimetable = transactionManager.create(TimetableEntity, {
        userId: user.id,
        timetableName: 'timetable 1',
        semester: timetable.semester,
        year: timetable.year,
        mainTimetable: true,
      });

      await transactionManager.save(newTimetable);
      return new DeleteTimetableResponseDto(true, newTimetable.id);
    }

    return new DeleteTimetableResponseDto(true, null);
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
      // 대표 시간표 없으면 시간표 하나 바로 생성
      return await this.createTimetable(
        this.timetableRepository.manager,
        {
          timetableName: 'timetable 1',
          semester: timetableDto.semester,
          year: timetableDto.year,
        },
        user,
      );
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
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    await this.timetableRepository.update(timetableId, {
      color: timetableColor,
    });
    timetable.color = timetableColor;
    return timetable;
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
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    await this.timetableRepository.update(timetableId, { timetableName });
    timetable.timetableName = timetableName;
    return timetable;
  }

  // 기존의 대표시간표의 mainTimetable column을 false로 변경하고, 새로운 시간표의 mainTimetable column을 true로 변경
  async updateMainTimetable(
    transactionManager: EntityManager,
    timetableId: number,
    user: AuthorizedUserDto,
    timetableDto: TimetableDto,
  ): Promise<CommonTimetableResponseDto> {
    const oldMainTimetable = await transactionManager.findOne(TimetableEntity, {
      where: {
        userId: user.id,
        year: timetableDto.year,
        semester: timetableDto.semester,
        mainTimetable: true,
      },
    });
    const newMainTimetable = await transactionManager.findOne(TimetableEntity, {
      where: {
        id: timetableId,
        userId: user.id,
        year: timetableDto.year,
        semester: timetableDto.semester,
      },
    });
    if (!newMainTimetable || !oldMainTimetable) {
      throwKukeyException('TIMETABLE_NOT_FOUND');
    } else if (oldMainTimetable.id === newMainTimetable.id) {
      throwKukeyException('ALREADY_MAIN_TIMETABLE');
    }

    await transactionManager.update(TimetableEntity, oldMainTimetable.id, {
      mainTimetable: false,
    });

    await transactionManager.update(TimetableEntity, newMainTimetable.id, {
      mainTimetable: true,
    });

    newMainTimetable.mainTimetable = true;
    return newMainTimetable;
  }

  async getTodayTimetable(
    timetableDto: TimetableDto,
    user: AuthorizedUserDto,
  ): Promise<GetTodayTimetableResponse> {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
    }) as DayType;

    const mainTimetable = await this.timetableRepository.findOne({
      where: {
        userId: user.id,
        year: timetableDto.year,
        semester: timetableDto.semester,
        mainTimetable: true,
      },
    });

    const todayCourses = await this.timetableCourseRepository
      .createQueryBuilder('timetableCourse')
      .leftJoinAndSelect('timetableCourse.course', 'course')
      .leftJoinAndSelect('course.courseDetails', 'courseDetail')
      .where('timetableCourse.timetableId = :timetableId', {
        timetableId: mainTimetable.id,
      })
      .andWhere('courseDetail.day = :today', { today })
      .getMany();

    const schedules = await this.scheduleService.getScheduleByTimetableId(
      mainTimetable.id,
    );
    const todaySchedules = schedules.filter(
      (schedule) => schedule.day === today,
    );

    const todayCoursesResponse = todayCourses.map((timetableCourse) => ({
      courseName: timetableCourse.course.courseName,
      classroom: timetableCourse.course.courseDetails[0].classroom,
      startTime: timetableCourse.course.courseDetails[0].startTime,
      endTime: timetableCourse.course.courseDetails[0].endTime,
      professorName: timetableCourse.course.professorName,
    }));

    const todaySchedulesResponse = todaySchedules.map((schedule) => ({
      scheduleName: schedule.title,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
    }));

    return new GetTodayTimetableResponse(
      todayCoursesResponse,
      todaySchedulesResponse,
    );
  }
}
