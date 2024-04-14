import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDetailDto {

    @IsNumber()
    @IsNotEmpty()
    courseId : number;
    
    @IsString()
    @IsOptional()
    day?: string;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    classroom?: string;
}