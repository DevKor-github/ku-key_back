export class ScreenshotVerificationResponseDto {
  constructor(sended: boolean, studentNumber: number) {
    this.sended = sended;
    this.studentNumber = studentNumber;
  }

  sended: boolean;
  studentNumber: number;
}
