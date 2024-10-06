import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import {
  kukeyException,
  kukeyExceptionName,
  kukeyExceptions,
} from 'src/utils/exception.util';

export function ApiKukeyExceptionResponse(names: kukeyExceptionName[]) {
  const kukeyExceptionResponseOptions: Record<number, ApiResponseOptions> = {};

  names.map((name) => {
    const kukeyException = kukeyExceptions[name];
    const statusCode = kukeyException.statusCode;

    if (!kukeyExceptionResponseOptions[statusCode]) {
      kukeyExceptionResponseOptions[statusCode] = {
        status: statusCode,
        content: {
          'application/json': {
            examples: {},
          },
        },
      };
    }
    kukeyExceptionResponseOptions[statusCode].content[
      'application/json'
    ].examples[name] = { value: kukeyException };
  });

  const apiResponseDecorators = Object.keys(kukeyExceptionResponseOptions).map(
    (statusCode) => {
      return ApiResponse(kukeyExceptionResponseOptions[statusCode]);
    },
  );

  return applyDecorators(
    ApiExtraModels(kukeyException),
    ...apiResponseDecorators,
  );
}
