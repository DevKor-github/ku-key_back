import { IsString, Length } from "class-validator";

export class SearchCourseDto {
    @IsString()
    @Length(2)
    search: string;
}