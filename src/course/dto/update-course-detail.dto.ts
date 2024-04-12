import { CreateCourseDetailDto } from "./create-course-detail.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateCourseDetailDto extends PartialType(CreateCourseDetailDto) {}