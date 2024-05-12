import { IsNotEmpty, IsNumber } from 'class-validator';

export class ScreenshotVerificationRequestDto {
  @IsNotEmpty()
  @IsNumber()
  studentNumber: number;
}
