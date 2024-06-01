import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetTimeTableByUserIdResponseDto {
  @IsNumber()
  @IsNotEmpty()
  tableId: number;

  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsString()
  @IsNotEmpty()
  year: string;

  @IsBoolean()
  @IsNotEmpty()
  mainTimeTable: boolean;

  @IsString()
  @IsNotEmpty()
  tableName: string;
}