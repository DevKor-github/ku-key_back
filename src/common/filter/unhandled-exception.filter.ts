import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { winstonLogger } from 'src/utils/winston.utils';

// 정의되지 않은 예외를 캐치하는 예외 필터
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
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

    let tokenPayload;
    let userId: string = 'Not Logged In';
    
    // 로그인한 사용자의 경우 - userId 추출
    if (request.headers['authorization']) {
      const splitedTokens = request.headers['authorization']
        .split(' ')[1]
        .split('.');
      tokenPayload = JSON.parse(atob(splitedTokens[1]));
      userId = tokenPayload.id;
    }

    const exceptionStack = exception.stack;
    const exceptionMethod = request.method;
    const exceptionUrl = request.url;
    winstonLogger.error({
      userId,
      exceptionMethod,
      exceptionUrl,
      exceptionStack,
      name,
      message,
      errorCode: 9999,
      statusCode,
    });

    response.status(statusCode).json({
      statusCode,
      errorCode: 9999,
      name,
      message,
    });
  }
}
