import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTimeTableNameDto {
  @IsString()
  @IsNotEmpty()
  tableName: string;
}
