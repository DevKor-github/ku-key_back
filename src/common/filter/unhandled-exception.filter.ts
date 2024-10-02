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
    let statusCode = 500;
    let name = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error!';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      name = `Unhandled Exception : ${exception.name}`;
      message = exception.message;
    } else if (exception instanceof Error) {
      name = `Unhandled Exception : ${exception.name}`;
      message = exception.message;
      console.error(exception);
    }

    response.status(statusCode).json({
      statusCode,
      errorCode: 9999,
      name,
      message,
    });
  }
}
