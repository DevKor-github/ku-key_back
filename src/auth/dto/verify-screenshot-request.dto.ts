import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class VerifyScreenshotRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  verify: boolean;
}
