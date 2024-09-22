import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const logFormat = (appName: string, colors?: boolean) =>
  winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(appName, {
      colors: colors || false,
      prettyPrint: true,
    }),
  );

const dailyOption = (level: string, folder: string, appName: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${folder}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 15,
    zippedArchive: true,
    logFormat: logFormat(appName),
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'prod' ? 'http' : 'debug',
      format: logFormat('KU-KEY', true),
    }),
    new winstonDaily(dailyOption('warn', 'warn', 'KU-KEY')),
    new winstonDaily(dailyOption('error', 'error', 'KU-KEY')),
  ],
});

export const loginLogger = WinstonModule.createLogger({
  transports: [new winstonDaily(dailyOption('info', 'login', 'KU-KEY-LOGIN'))],
});
