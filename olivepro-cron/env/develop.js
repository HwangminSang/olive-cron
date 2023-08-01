'use strict'

const dotenv = require('dotenv')
const { env } = require('./index')
const logger = require('../winston/logger')

if (process.env.ISDEBUG === 'true') {
  process.env.NODE_ENV === 'production'
    ? dotenv.config({ path: '.env.prod' })
    : process.env.NODE_ENV === 'develop'
    ? dotenv.config({ path: '.env.dev' })
    : process.env.NODE_ENV === 'local'
    ? dotenv.config({ path: '.env.local' })
    : log.err('Error: Unable to read value for operating environment.')
}

logger.info(`cron handler ==> ${process.env.NODE_ENV} server started`)

// const host = process.env.MYSQL_HOST
// const user = process.env.MYSQL_USER
// const pw = process.env.MYSQL_PASSWORD
// const db = process.env.MYSQL_DATABASE

// TODO: 개발 모드일 경우 검증용
const host = process.env.MYSQL_HOST || 'olivepro-new-prod.cluster-coluvj80rday.ap-northeast-2.rds.amazonaws.com'
const user = process.env.MYSQL_USER || 'root'
const pw = process.env.MYSQL_PASSWORD || 'dhfflqm0704'
const db = process.env.MYSQL_DATABASE || 'olivepro_dev_social5'

logger.info(host)
logger.info(db)
logger.info(user)

logger.info(`cron handler ==> ${process.env.NODE_ENV} server called`)

// MYSQL_HOST: env.MYSQL_HOST || 'olivepro-new-prod.cluster-coluvj80rday.ap-northeast-2.rds.amazonaws.com',
// MYSQL_USER: env.MYSQL_USER || 'root',
// MYSQL_PASSWORD: env.MYSQL_PASSWORD || 'dhfflqm0704',
// MYSQL_DATABASE: env.MYSQL_DATABASE || 'olivepro_dev_social5',

module.exports = {
  isTest: true,
  debug: true,
  clustering: false,
  logOptions: {
    level: 'verbose',
    colorize: true,
  },
  makeTable: true,

  // MYSQL_HOST: host,
  // MYSQL_USER: user,
  // MYSQL_PASSWORD: pw,
  // MYSQL_DATABASE: db,

  mysql: {
    username: user,
    password: pw,
    database: db,
    host: host,
    port: 3306,
    dialect: 'mysql',
    pool: {
      min: 0,
      max: 5,
      idle: 10000,
      acquire: 30000,
    },
    // operatorsAliases: false,
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci',
      },
    },
  },
}
