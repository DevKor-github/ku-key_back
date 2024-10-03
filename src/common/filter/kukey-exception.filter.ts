import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { kukeyException } from 'src/utils/exception.util';
import { winstonLogger } from 'src/utils/winston.utils';

// 이미 정의된 kukeyException을 캐치하는 예외 필터
@Catch(kukeyException)
export class KukeyExceptionFilter implements ExceptionFilter {
  catch(exception: kukeyException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const { name, message, errorCode, statusCode } = exception;

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
    const exceptionUrl = request.url;
    const exceptionMethod = request.method;
    winstonLogger.warn({
      userId,
      exceptionMethod,
      exceptionUrl,
      name,
      errorCode,
      statusCode,
    });

    response.status(statusCode).json({
      statusCode,
      errorCode,
      name,
      message,
    });
  }
}
