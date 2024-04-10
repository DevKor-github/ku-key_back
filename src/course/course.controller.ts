import { Body, Controller, Post } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseService } from './course.service';

@Controller('course')
export class CourseController {
    constructor(private courseService: CourseService){}

    @Post()
    async createCourse(
        @Body() createCourseDto : CreateCourseDto,
    ): Promise<CourseEntity>{
        return await this.courseService.createCourse(createCourseDto);
    }

}
