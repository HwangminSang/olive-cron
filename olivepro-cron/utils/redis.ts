import dotenv from 'dotenv';
import { createClient } from 'redis';

import { log } from '../winston/logger';

if (process.env.ISDEBUG === 'true') {
  process.env.NODE_ENV === 'production'
    ? dotenv.config({ path: '.env.prod' })
    : process.env.NODE_ENV === 'develop'
    ? dotenv.config({ path: '.env.dev' })
    : process.env.NODE_ENV === 'local'
    ? dotenv.config({ path: '.env.local' })
    : dotenv.config({ path: '.env.dev' })
}

if (typeof process.env.REDIS_URL !== 'string' && process.env.NODE_ENV === 'local') {
  log.err('Error: Environment variable for Redis server URL is required.')
  throw 'Error: Environment variable for Redis server URL is required.'
}

const redisServerUrl: string | undefined = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const redisServerHost: string | undefined = process.env.REDIS_HOST || '127.0.0.1'
const redisServerPort: number = Number(process.env.REDIS_PORT) || 6379

if (typeof redisServerHost !== 'string' || typeof redisServerPort !== 'number') {
  log.err('Redis connects fail!')
  throw `Error: Environment variable for Redis server Host, Port is required. ${redisServerHost}, ${redisServerPort}`
}

export let redisCli: any = null

export const redisClient = async () => {
  console.time('Redis reconnectStrategy')
  log.info(`Redis Server connect Info : ${redisServerHost} ${redisServerPort}`)
  try {
    const client = createClient({
      socket: {
        host: redisServerHost,
        port: redisServerPort,
        connectTimeout: 3000,
        reconnectStrategy() {
          console.timeLog('Redis reconnectStrategy', 'reconnectStrategy')
          return 3000
        },
      },
    })
      .on('connect', () => {
        console.timeLog('Redis reconnectStrategy', 'Redis Server connect')
        log.info('Redis Server connect')
      })
      .on('ready', () => {
        console.timeLog('Redis reconnectStrategy', 'Redis Server ready')
        log.info('Redis Server ready')
      })
      .on('reconnecting', () => {
        console.timeLog('Redis reconnectStrategy', 'Redis Server reconnecting')
        log.info('Redis Server reconnecting')
      })
      .on('error', error => {
        console.timeLog('Redis reconnectStrategy', 'Redis connect error')
        log.err(`Redis client error: ${JSON.stringify(error)}`)
      })

    await client.connect()

    const pingCommandResult = await client.ping()
    console.log('Ping command result: ', pingCommandResult)

    const getCountResult = await client.get('count')
    console.log('Get count result: ', getCountResult)

    const incrCountResult = await client.incr('count')
    console.log('Increase count result: ', incrCountResult)

    const newGetCountResult = await client.get('count')
    console.log('New get count result: ', newGetCountResult)

    await client.set(
      'object',
      JSON.stringify({
        name: 'Redis',
        lastname: 'Client',
      })
    )

    const getStringResult = await client.get('object')
    console.log('Get string result: ', JSON.parse(getStringResult))

    return (redisCli = client)
  } catch (err) {
    log.err(`Redis Service start error` + err)
    log.err('Redis server not connected')
  }
}
