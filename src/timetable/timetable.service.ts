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
import { UserTimeTableDto } from './dto/user-timetable.dto';

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
        relations: ['courseDetail'],
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

      // 시간표에 존재하는 강의들이랑 추가하려는 강의랑 시간 겹치는지 확인
      const isConflict = await this.checkCourseConflict(timeTableId, courseId);

      if (isConflict) {
        throw new ConflictException('Course conflicts with existing courses');
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

  async checkCourseConflict(
    timeTableId: number,
    courseId: number,
  ): Promise<boolean> {
    const existingCoursesInfo = await this.getCourseDaysAndPeriods(timeTableId);
    const newCourseInfo = await this.courseDetailRepository.find({
      where: { courseId: courseId },
    });

    for (const newDetail of newCourseInfo) {
      for (const existingInfo of existingCoursesInfo) {
        if (
          existingInfo.day === newDetail.day &&
          this.isConflictingPeriod(existingInfo.period, newDetail.period)
        ) {
          return true; // 겹치는 교시 존재
        }
      }
    }

    return false; // 겹치는 교시 없음
  }

  async getCourseDaysAndPeriods(
    timeTableId: number,
  ): Promise<{ day: string; period: string }[]> {
    const courseDaysAndPeriods = await this.timeTableCourseRepository
      .createQueryBuilder('ttc') //time_table_course
      .leftJoinAndSelect('ttc.course', 'course')
      .leftJoinAndSelect('course.courseDetail', 'courseDetail')
      .where('ttc.timeTableId = :timeTableId', { timeTableId })
      .select(['courseDetail.day', 'courseDetail.period'])
      .getRawMany();

    const result = courseDaysAndPeriods.map((obj) => ({
      day: obj.courseDetail_day,
      period: obj.courseDetail_period,
    }));

    return result;
  }

  private isConflictingPeriod(
    existingPeriod: string,
    newPeriod: string,
  ): boolean {
    const existingRange = existingPeriod.split('-').map(Number);
    const newRange = newPeriod.split('-').map(Number);

    for (let i = newRange[0]; i <= newRange[newRange.length - 1]; i++) {
      if (
        i >= existingRange[0] &&
        i <= existingRange[existingRange.length - 1]
      ) {
        return true; // 겹치는 교시가 존재
      }
    }

    return false; // 겹치는 교시 없음
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

  async getTimeTable(
    timeTableId: number,
    user: AuthorizedUserDto,
  ): Promise<TimeTableEntity> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }
      return timeTable;
    } catch (error) {
      console.error('Failed to get TimeTable: ', error);
      throw error;
    }
  }

  async getTimeTableByUserId(userId: number): Promise<UserTimeTableDto[]> {
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
      }));
    } catch (error) {
      console.error('Failed to get TimeTable: ', error);
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
    return await this.timeTableRepository.findOne({
      where: {
        userId: user.id,
        mainTimeTable: true,
        year: timeTableDto.year,
        semester: timeTableDto.semester,
      },
    });
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
