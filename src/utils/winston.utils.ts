import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

// 메타 데이터를 포함한 포맷 정의
const singleLineFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    const {
      userId,
      exceptionMethod,
      exceptionUrl,
      name,
      errorCode,
      statusCode,
    } = meta;

    // 명시적으로 순서대로 포맷팅하여 출력
    return `{${timestamp}} [errorCode: ${errorCode}] ${exceptionMethod} ${exceptionUrl} - ${name} (status: ${statusCode}, userId: ${userId})`;
  },
);

const multiLineFormat = (appName: string, colors?: boolean) =>
  winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(appName, {
      colors: colors || false,
      prettyPrint: true,
    }),
  );

const multiLineOption = (level: string, folder: string, appName: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${folder}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 15,
    zippedArchive: true,
    format: multiLineFormat(appName),
  };
};

const singleLineOption = (level: string, folder: string, appName: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${folder}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 15,
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.label({ label: appName }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      singleLineFormat,
    ),
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'prod' ? 'http' : 'debug',
      format: multiLineFormat('KU-KEY', true),
    }),
    new winstonDaily(singleLineOption('warn', 'warn', 'KU-KEY')),
    new winstonDaily(multiLineOption('error', 'error', 'KU-KEY')),
  ],
});

export const loginLogger = WinstonModule.createLogger({
  transports: [
    new winstonDaily(multiLineOption('info', 'login', 'KU-KEY-LOGIN')),
  ],
});
