import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    professor_name: string;
    
    @IsString()
    @IsNotEmpty()
    category : string;

    @IsString()
    college : string;

    @IsString()
    @IsNotEmpty()
    course_name : string;

    @IsString()
    @IsNotEmpty()
    course_code : string;

    @IsNumber()
    @IsNotEmpty()
    credit : number;

    @IsString()
    major: string;

    @IsBoolean()
    @IsNotEmpty()
    has_exchange_seat : boolean;

    @IsString()
    @IsNotEmpty()
    year : string;

    @IsString()
    @IsNotEmpty()
    semester: string;
}