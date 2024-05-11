import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimeTableRepository } from './timetable.repository';
import { CourseRepository } from 'src/course/course.repository';
import { TimeTableCourseRepository } from './timetable-course.repository';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { CourseDetailRepository } from 'src/course/course-detail.repository';

@Injectable()
export class TimeTableService {
  constructor(
    private readonly timeTableRepository: TimeTableRepository,
    private readonly courseRepository: CourseRepository,
    private readonly timeTableCourseRepository: TimeTableCourseRepository,
    private readonly courseDetailRepository: CourseDetailRepository,
  ) {}

  async createTimeTableCourse(
    timeTableId: number,
    courseId: number,
  ): Promise<TimeTableCourseEntity> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId },
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

      const timeTableCourse = new TimeTableCourseEntity();
      timeTableCourse.timeTableId = timeTableId;
      timeTableCourse.courseId = courseId;
      timeTableCourse.timeTable = timeTable;
      timeTableCourse.course = course;

      return this.timeTableCourseRepository.save(timeTableCourse);
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
  ): Promise<TimeTableEntity> {
    return await this.timeTableRepository.createTimeTable(createTimeTableDto);
  }

  async getTimeTable(timeTableId: number): Promise<TimeTableEntity> {
    return await this.timeTableRepository.findOne({
      where: { id: timeTableId },
    });
  }

  async deleteTimeTable(timeTableId: number): Promise<void> {
    await this.timeTableRepository.delete({ id: timeTableId });
  }
}
