export class SignUpResponseDto {
  constructor(sended: boolean, studentNumber: number) {
    this.sended = sended;
    this.studentNumber = studentNumber;
  }

  sended: boolean;
  studentNumber: number;
}
