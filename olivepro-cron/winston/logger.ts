'use strict'

import { createLogger, format, transports } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const logDir = process.env.NODE_ENV === 'develop' ? './logs' : './logs'

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 }

const level = () => {
  const env = process.env.NODE_ENV || 'develop'
  const isDevelopment = env === 'develop'
  return isDevelopment ? 'debug' : 'warn'
}

// const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue', }
// winston.addColors(colors);

const { combine, timestamp, prettyPrint, label, printf, colorize } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
  format: combine(timestamp({ format: ' YYYY-MM-DD HH:MM:SS ||' }), logFormat),
  level: level(),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      zippedArchive: true,
      handleExceptions: true,
      maxFiles: 30,
    }),
    // warn 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/warn',
      filename: `%DATE%.warn.log`, // file 이름 날짜로 저장
      maxFiles: 30, // 30일치 로그 파일 저장
      zippedArchive: true,
    }),
    new transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.error.log`,
      zippedArchive: true,
      maxFiles: 30,
    }),
    new transports.Console({
      handleExceptions: true,
      level: 'verbose',
    }),
  ],
})

export const stream = {
  write: (message: any) => {
    logger.info(message)
  },
}

// Production 환경이 아닌 경우(dev 등)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
        logFormat // log format 적용
      ),
    })
  )
}

logger.exitOnError = false

export class log {
  static info(info: string) {
    logger.info(info)
  }
  static warn(warn: string) {
    logger.warn(warn)
  }
  static err(err: string) {
    logger.error(err)
  }
  static http(err: string) {
    logger.http(err)
  }
  static debug(err: string) {
    logger.debug(err)
  }
}
