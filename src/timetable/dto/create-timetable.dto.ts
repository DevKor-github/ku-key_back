import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTimeTableDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    tableName : string;
    
    @IsString()
    @IsNotEmpty()
    semester : string;

    @IsString()
    @IsNotEmpty()
    year : string;
}