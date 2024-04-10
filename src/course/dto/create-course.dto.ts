import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    professorName: string;
    
    @IsString()
    @IsNotEmpty()
    category : string;

    @IsString()
    college : string;

    @IsString()
    @IsNotEmpty()
    courseName : string;

    @IsString()
    @IsNotEmpty()
    courseCode : string;

    @IsNumber()
    @IsNotEmpty()
    credit : number;

    @IsString()
    major: string;

    @IsBoolean()
    @IsNotEmpty()
    hasExchangeSeat: boolean;

    @IsString()
    @IsNotEmpty()
    year : string;

    @IsString()
    @IsNotEmpty()
    semester: string;
}