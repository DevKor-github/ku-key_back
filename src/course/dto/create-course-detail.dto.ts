import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCourseDetailDto {

    @IsNumber()
    @IsNotEmpty()
    courseId : number;
    
    @IsString()
    @IsNotEmpty()
    day : string;

    @IsString()
    @IsNotEmpty()
    startTime : string;

    @IsString()
    @IsNotEmpty()
    endTime : string;

    @IsString()
    @IsNotEmpty()
    classroom : string;
}