const dotenv = require('dotenv')

import { log } from '../winston/logger';

if (process.env.ISDEBUG === 'true') {
  process.env.NODE_ENV === 'production'
    ? dotenv.config({ path: '.env.prod' })
    : process.env.NODE_ENV === 'develop'
    ? dotenv.config({ path: '.env.dev' })
    : process.env.NODE_ENV === 'local'
    ? dotenv.config({ path: '.env.local' })
    : log.err('Error: Unable to read value for operating environment.')
}
log.info(`cron ${process.env.NODE_ENV} server database info : ${process.env.MYSQL_HOST} in config.ts`)

interface CreatePoolProps {
  host: string
  user: string
  password?: string
  database?: string
  port: number
  connectionLimit: number
}
log.info(` process.env.MYSQL_HOST :${process.env.MYSQL_HOST} in config.ts`)
log.info(` process.env.MYSQL_USER :${process.env.MYSQL_USER} in config.ts`)
log.info(` process.env.MYSQL_PASSWORD :${process.env.MYSQL_PASSWORD} in config.ts`)
log.info(` process.env.MYSQL_DATABASE :${process.env.MYSQL_DATABASE} in config.ts`)
if (process.env.MYSQL_HOST === undefined || process.env.MYSQL_USER === undefined || process.env.MYSQL_PASSWORD === undefined || process.env.MYSQL_DATABASE === undefined) {
  const error = 'Could not read db settings from environment variables.'
  log.err(error)
  throw error
}

export const dbPoolProp: CreatePoolProps = {
  host: process.env.MYSQL_HOST || 'olivepro-new-prod.cluster-coluvj80rday.ap-northeast-2.rds.amazonaws.com',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'dhfflqm0704',
  database: process.env.MYSQL_DATABASE || 'olivepro_dev_social5',
  port: 3306,
  connectionLimit: 4
}

export default dbPoolProp
