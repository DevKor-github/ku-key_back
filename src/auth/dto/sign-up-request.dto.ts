import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateUserRequestDto } from 'src/user/dto/create-user-request.dto';

export class SignUpRequestDto extends CreateUserRequestDto {
  @IsNotEmpty()
  @IsNumber()
  studentNumber: number;
}
