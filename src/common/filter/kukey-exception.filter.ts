import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { kukeyException } from 'src/utils/exception.util';
import { extractUserId } from 'src/utils/user-id-extractor.util';
import { winstonLogger } from 'src/utils/winston.utils';

// 이미 정의된 kukeyException을 캐치하는 예외 필터
@Catch(kukeyException)
export class KukeyExceptionFilter implements ExceptionFilter {
  catch(exception: kukeyException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const { name, message, errorCode, statusCode } = exception;

    const userId = extractUserId(request);
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
