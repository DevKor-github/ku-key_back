import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

// 정의되지 않은 예외를 캐치하는 예외 필터
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(500).json({
      statusCode: 500,
      errorCode: 9999,
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
    });
  }
}
