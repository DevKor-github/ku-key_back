import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TimeTableRepository } from './timetable.repository';
import { CourseRepository } from 'src/course/course.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';
import { TimeTableDto } from './dto/timetable.dto';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { CourseDetailRepository } from 'src/course/course-detail.repository';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { DataSource } from 'typeorm';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { GetTimeTableByUserIdResponseDto } from './dto/userId-timetable.dto';
import {
  DayType,
  GetTimeTableByTimeTableIdResponseDto,
} from './dto/timetableId-timetable.dto';

@Injectable()
export class TimeTableService {
  constructor(
    private readonly timeTableRepository: TimeTableRepository,
    private readonly courseRepository: CourseRepository,
    private readonly timeTableCourseRepository: TimeTableCourseRepository,
    private readonly courseDetailRepository: CourseDetailRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createTimeTableCourse(
    timeTableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<TimeTableCourseEntity> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['courseDetails'],
      });
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

      // 시간표에 존재하는 강의와 추가하려는 강의가 시간 겹치는지 확인
      const isConflict = await this.checkTimeConflict(
        timeTableId,
        courseId,
        undefined,
      );

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
    courseId?: number,
    scheduleId?: number,
  ): Promise<boolean> {
    const existingTableInfo = await this.getTableInfo(timeTableId); //요일, 시작시간, 끝나는 시간 받아옴
    const newCourseInfo = await this.courseDetailRepository.find({
      where: { courseId: courseId },
    });

    for (const newDetail of newCourseInfo) {
      for (const existingInfo of existingTableInfo) {
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

  async getTableInfo(
    timeTableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const daysAndTimes = await this.timeTableCourseRepository
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

    const result = daysAndTimes.map((obj) => ({
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
    }));

    return result;
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
  ): Promise<TimeTableEntity> {
    try {
      // 해당 user가 해당 년도, 해당 학기에 몇 개의 시간표를 가지고 있는 지 확인
      const existingTimeTableNumber = await this.timeTableRepository.count({
        where: {
          userId: user.id,
          year: createTimeTableDto.year,
          semester: createTimeTableDto.semester,
        },
      });
      if (existingTimeTableNumber >= 3) {
        throw new ConflictException('Maximum number of TimeTables reached');
      }

      const isFirstTable = existingTimeTableNumber === 0; // 처음 생성하는 시간표인지 확인 (대표시간표가 될 예정)

      const newTimeTable = this.timeTableRepository.create({
        userId: user.id,
        tableName: createTimeTableDto.tableName,
        semester: createTimeTableDto.semester,
        year: createTimeTableDto.year,
        mainTimeTable: isFirstTable,
      });

      return await this.timeTableRepository.save(newTimeTable);
    } catch (error) {
      console.error('Failed to create TimeTable:', error);
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An internal error occurred');
      }
    }
  }

  async getTimeTableByTimeTableId(
    timeTableId: number,
    user: AuthorizedUserDto,
  ): Promise<GetTimeTableByTimeTableIdResponseDto[]> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
        relations: [
          'timeTableCourse',
          'timeTableCourse.course',
          'timeTableCourse.course.courseDetail',
        ],
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const GetTimeTableByTimeTableIdResponse = timeTable.timeTableCourses
        .map((courseEntry) => {
          const { professorName, courseName, courseCode } = courseEntry.course;
          return courseEntry.course.courseDetails.map((detailEntry) => {
            const { day, startTime, endTime, classroom } = detailEntry;
            return {
              professorName,
              courseName,
              courseCode,
              day: day as DayType,
              startTime,
              endTime,
              classroom,
            };
          });
        })
        .flat(); // flat으로 다차원 배열 평탄화

      return GetTimeTableByTimeTableIdResponse;
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
        tableId: table.id,
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

  // 시간표에 등록한 강의 삭제
  async deleteTimeTableCourse(
    timeTableId: number,
    courseId: number,
    user: AuthorizedUserDto,
  ): Promise<void> {
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
    } catch (error) {
      console.error('Failed to delete TimeTableCourse: ', error);
      throw error;
    }
  }

  async deleteTimeTable(
    timeTableId: number,
    user: AuthorizedUserDto,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const timeTable = await queryRunner.manager.findOne(TimeTableEntity, {
        where: { id: timeTableId, userId: user.id },
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
      await queryRunner.manager.softDelete(TimeTableEntity, {
        id: timeTableId,
      });
      await queryRunner.commitTransaction();
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
  ): Promise<TimeTableEntity> {
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

  // 시간표 이름 변경
  async updateTimeTableName(
    timeTableId: number,
    user: AuthorizedUserDto,
    tableName: string,
  ): Promise<TimeTableEntity> {
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
  ): Promise<TimeTableEntity> {
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
