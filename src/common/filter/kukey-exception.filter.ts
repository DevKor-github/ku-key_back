import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { kukeyException } from 'src/utils/exception.util';

// 이미 정의된 kukeyException을 캐치하는 예외 필터
@Catch(kukeyException)
export class KukeyExceptionFilter implements ExceptionFilter {
  catch(exception: kukeyException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const { name, message, errorCode, statusCode } = exception;

    response.status(statusCode).json({
      statusCode,
      errorCode,
      name,
      message,
    });
  }
}
