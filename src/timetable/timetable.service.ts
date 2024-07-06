import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { TimeTableRepository } from './timetable.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { TimeTableDto } from './dto/timetable.dto';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { DataSource } from 'typeorm';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { GetTimeTableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { DayType } from './dto/get-courseinfo-timetable.dto';
import { CourseService } from 'src/course/course.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';
import { CreateTimeTableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimeTableResponseDto } from './dto/common-timetable-response.dto';
import { GetTimeTableByTimeTableIdDto } from './dto/get-timetable-timetable.dto';
import { ColorType } from './dto/update-timetable-color.dto';

@Injectable()
export class TimeTableService {
  constructor(
    private readonly timeTableRepository: TimeTableRepository,
    private readonly timeTableCourseRepository: TimeTableCourseRepository,
    private readonly courseService: CourseService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ScheduleService))
    private readonly scheduleService: ScheduleService,
  ) {}

  // 시간표에 강의 추가 -> 강의랑 개인 스케쥴 둘 다 확인 필요
  async createTimeTableCourse(
    timeTableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<CreateTimeTableCourseResponseDto> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const course =
        await this.courseService.getCourseWithCourseDetails(courseId);

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // TimeTableCourse 테이블에 이미 동일한 레코드가 존재하는지 확인
      const existingTimeTableCourse =
        await this.timeTableCourseRepository.findOne({
          where: { timeTableId, courseId },
        });
      if (existingTimeTableCourse) {
        throw new ConflictException('Already exists in TimeTable');
      }

      // 시간표에 존재하는 강의, 스케쥴과 추가하려는 강의가 시간이 겹치는 지 확인
      const isConflict = await this.checkTimeConflict(timeTableId, courseId);

      if (isConflict) {
        throw new ConflictException(
          'Course conflicts with existing courses and schedules',
        );
      }

      const timeTableCourse = this.timeTableCourseRepository.create({
        timeTableId,
        courseId,
        timeTable,
        course,
      });

      return await this.timeTableCourseRepository.save(timeTableCourse);
    } catch (error) {
      console.error('Failed to create TimeTableCourse:', error);
      throw error;
    }
  }

  async checkTimeConflict(
    timeTableId: number,
    courseId: number,
  ): Promise<boolean> {
    // 강의시간 겹치는지 안겹치는지 확인
    const existingCourseInfo = await this.getTableCourseInfo(timeTableId); //요일, 시작시간, 끝나는 시간 받아옴
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
    const existingScheduleInfo = await this.getTableScheduleInfo(timeTableId);
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

  async getDaysAndTime(timeTableId: number) {
    return await this.timeTableCourseRepository
      .createQueryBuilder('ttc') //time_table_course
      .leftJoinAndSelect('ttc.course', 'course')
      .leftJoinAndSelect('course.courseDetails', 'courseDetail')
      .where('ttc.timeTableId = :timeTableId', { timeTableId })
      .select([
        'courseDetail.day as day',
        'courseDetail.startTime as startTime',
        'courseDetail.endTime as endTime',
      ])
      .getRawMany();
  }
  async getTableCourseInfo(
    timeTableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const daysAndTimes = await this.getDaysAndTime(timeTableId);

    const result = daysAndTimes.map((obj) => ({
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
    }));

    return result;
  }

  async getTableScheduleInfo(
    timeTableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const schedules =
      await this.scheduleService.getTableScheduleInfo(timeTableId);

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

  async createTimeTable(
    createTimeTableDto: CreateTimeTableDto,
    user: AuthorizedUserDto,
  ): Promise<CommonTimeTableResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 해당 user가 해당 년도, 해당 학기에 몇 개의 시간표를 가지고 있는 지 확인
      const existingTimeTableNumber = await queryRunner.manager.count(
        TimeTableEntity,
        {
          where: {
            userId: user.id,
            year: createTimeTableDto.year,
            semester: createTimeTableDto.semester,
          },
        },
      );

      if (existingTimeTableNumber >= 3) {
        throw new ConflictException('Maximum number of TimeTables reached');
      }

      const isFirstTable = existingTimeTableNumber === 0; // 처음 생성하는 시간표인지 확인 (대표시간표가 될 예정)

      const newTimeTable = queryRunner.manager.create(TimeTableEntity, {
        userId: user.id,
        tableName: createTimeTableDto.tableName,
        semester: createTimeTableDto.semester,
        year: createTimeTableDto.year,
        mainTimeTable: isFirstTable,
      });

      await queryRunner.manager.save(newTimeTable);
      await queryRunner.commitTransaction();
      return newTimeTable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to create TimeTable:', error);
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An internal error occurred');
      }
    } finally {
      await queryRunner.release();
    }
  }

  async getSimpleTimeTableByTimeTableId(
    timeTableId: number,
    userId: number,
  ): Promise<CommonTimeTableResponseDto> {
    return await this.timeTableRepository.findOne({
      where: { id: timeTableId, userId },
    });
  }

  async getTimeTableByTimeTableId(
    timeTableId: number,
    userId: number,
  ): Promise<GetTimeTableByTimeTableIdDto> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId },
        relations: [
          'timeTableCourses',
          'timeTableCourses.course',
          'timeTableCourses.course.courseDetails',
        ],
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const schedules =
        await this.scheduleService.getScheduleByTimeTableId(timeTableId);

      // 코스 정보와 스케줄 정보를 같은 깊이의 객체로 분리하여 반환
      const getTimeTableByTimeTableIdResponse: GetTimeTableByTimeTableIdDto = {
        courses: [],
        schedules: [],
        color: timeTable.color,
        tableName: timeTable.tableName,
      };
      timeTable.timeTableCourses.forEach((courseEntry) => {
        const {
          id: courseId,
          professorName,
          courseName,
          courseCode,
        } = courseEntry.course;

        courseEntry.course.courseDetails.forEach((detailEntry) => {
          const { day, startTime, endTime, classroom } = detailEntry;

          // 강의 정보 객체
          getTimeTableByTimeTableIdResponse.courses.push({
            courseId,
            professorName,
            courseName,
            courseCode,
            day: day as DayType,
            startTime,
            endTime,
            classroom,
          });
        });
      });

      // 스케줄 정보 객체
      schedules.forEach((schedule) => {
        getTimeTableByTimeTableIdResponse.schedules.push({
          scheduleId: schedule.id,
          scheduleTitle: schedule.title,
          scheduleDay: schedule.day as DayType,
          scheduleStartTime: schedule.startTime,
          scheduleEndTime: schedule.endTime,
          location: schedule.location,
        });
      });

      return getTimeTableByTimeTableIdResponse;
    } catch (error) {
      console.error('Failed to get TimeTable: ', error);
      throw error;
    }
  }

  async getTimeTableByUserId(
    userId: number,
  ): Promise<GetTimeTableByUserIdResponseDto[]> {
    try {
      const userTimeTable = await this.timeTableRepository.find({
        where: { userId },
      });
      if (!userTimeTable) throw new NotFoundException('TimeTable not found');
      return userTimeTable.map((table) => ({
        timeTableId: table.id,
        semester: table.semester,
        year: table.year,
        mainTimeTable: table.mainTimeTable,
        tableName: table.tableName,
      }));
    } catch (error) {
      console.error('Failed to get TimeTable: ', error);
      throw error;
    }
  }

  // 친구 시간표 조회
  async getFriendTimeTable(
    friendId: number,
    semester: string,
    year: string,
  ): Promise<GetTimeTableByTimeTableIdDto> {
    const timeTable = await this.timeTableRepository.findOne({
      where: {
        userId: friendId,
        year,
        semester,
        mainTimeTable: true,
      },
    });

    // 시간표가 없을 경우
    if (!timeTable) {
      throw new NotFoundException('친구 시간표가 존재하지 않습니다!');
    }

    // 시간표 id 추출 후 구현해놓은 함수 사용
    const friendTimeTableId = timeTable.id;
    return await this.getTimeTableByTimeTableId(friendTimeTableId, friendId);
  }

  // 시간표에 등록한 강의 삭제
  async deleteTimeTableCourse(
    timeTableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    try {
      // 해당 유저가 만든 시간표인지 확인
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
      });

      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const timeTableCourse = await this.timeTableCourseRepository.findOne({
        where: { timeTableId, courseId },
      });
      if (!timeTableCourse) {
        throw new NotFoundException('There is no course in this timetable!');
      }

      await this.timeTableCourseRepository.softDelete({
        timeTableId,
        courseId,
      });

      return { deleted: true };
    } catch (error) {
      console.error('Failed to delete TimeTableCourse: ', error);
      throw error;
    }
  }

  async deleteTimeTable(
    timeTableId: number,
    user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const timeTable = await queryRunner.manager.findOne(TimeTableEntity, {
        where: { id: timeTableId, userId: user.id },
        relations: ['timeTableCourses', 'schedules'], // soft-remove cascade 조건을 위해 추가
      });

      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      if (timeTable.mainTimeTable) {
        const nextMainTimeTable = await queryRunner.manager.findOne(
          TimeTableEntity,
          {
            where: {
              userId: user.id,
              year: timeTable.year,
              semester: timeTable.semester,
              mainTimeTable: false,
            },
            order: { createdAt: 'ASC' },
          },
        );

        if (nextMainTimeTable) {
          nextMainTimeTable.mainTimeTable = true;
          await queryRunner.manager.save(nextMainTimeTable);
        }
      }
      await queryRunner.manager.softRemove(timeTable);
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to delete TimeTable: ', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMainTimeTable(
    timeTableDto: TimeTableDto,
    user: AuthorizedUserDto,
  ): Promise<CommonTimeTableResponseDto> {
    try {
      const mainTimeTable = await this.timeTableRepository.findOne({
        where: {
          userId: user.id,
          mainTimeTable: true,
          year: timeTableDto.year,
          semester: timeTableDto.semester,
        },
      });

      if (!mainTimeTable) {
        throw new NotFoundException('MainTimeTable not found');
      }
      return mainTimeTable;
    } catch (error) {
      console.error('Failed to get MainTimeTable: ', error);
      throw error;
    }
  }

  // 시간표 색상 변경
  async updateTimeTableColor(
    timeTableId: number,
    user: AuthorizedUserDto,
    tableColor: ColorType,
  ): Promise<CommonTimeTableResponseDto> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: {
          id: timeTableId,
          userId: user.id,
        },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      timeTable.color = tableColor;
      return await this.timeTableRepository.save(timeTable);
    } catch (error) {
      console.error('Failed to update TimeTable color: ', error);
      throw error;
    }
  }

  // 시간표 이름 변경
  async updateTimeTableName(
    timeTableId: number,
    user: AuthorizedUserDto,
    tableName: string,
  ): Promise<CommonTimeTableResponseDto> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: {
          id: timeTableId,
          userId: user.id,
        },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      timeTable.tableName = tableName;
      return await this.timeTableRepository.save(timeTable);
    } catch (error) {
      console.error('Failed to update TimeTable name: ', error);
      throw error;
    }
  }

  // 기존의 대표시간표의 mainTimeTable column을 false로 변경하고, 새로운 시간표의 mainTimeTable column을 true로 변경
  async updateMainTimeTable(
    timeTableId: number,
    user: AuthorizedUserDto,
    timeTableDto: TimeTableDto,
  ): Promise<CommonTimeTableResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const oldMainTimeTable = await queryRunner.manager.findOne(
        TimeTableEntity,
        {
          where: {
            userId: user.id,
            year: timeTableDto.year,
            semester: timeTableDto.semester,
            mainTimeTable: true,
          },
        },
      );
      const newMainTimeTable = await queryRunner.manager.findOne(
        TimeTableEntity,
        {
          where: {
            id: timeTableId,
            userId: user.id,
            year: timeTableDto.year,
            semester: timeTableDto.semester,
          },
        },
      );
      if (!newMainTimeTable || !oldMainTimeTable) {
        throw new NotFoundException('TimeTable not found');
      } else if (oldMainTimeTable.id === newMainTimeTable.id) {
        throw new ConflictException('Already main TimeTable');
      }

      oldMainTimeTable.mainTimeTable = false;
      newMainTimeTable.mainTimeTable = true;
      await queryRunner.manager.save(oldMainTimeTable);
      await queryRunner.manager.save(newMainTimeTable);
      await queryRunner.commitTransaction();

      return newMainTimeTable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
