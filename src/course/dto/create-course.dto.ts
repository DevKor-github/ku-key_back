import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    professorName: string;
    
    @IsString()
    @IsNotEmpty()
    category : string;

    @IsString()
    @IsOptional()
    college?: string;

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
    @IsOptional()
    major?: string;

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