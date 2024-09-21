import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const loginLoggerOption = () => {
  return {
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/login`, // login 폴더에 로그 저장
    filename: `%DATE%.login.log`,
    maxFiles: 15, // 로그 보관 일수
    zippedArchive: true, // 압축
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike('KU-KEY-LOGIN', {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

const dailyOption = (level: string, folder: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${folder}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 15,
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike('KU-KEY', {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'prod' ? 'http' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike('KU-KEY', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winstonDaily(dailyOption('warn', 'warn')),
    new winstonDaily(dailyOption('error', 'error')),
  ],
});

export const loginLogger = WinstonModule.createLogger({
  transports: [new winstonDaily(loginLoggerOption())],
});
