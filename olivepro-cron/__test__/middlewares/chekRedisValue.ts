import { createClient } from 'redis';
const { log } =require('../../winston/logger')
const redisKey = "821051246325"

const client = createClient()

const redisCheck = async (redisKey: string) => {
  await client.connect();
  const testVal = await client.get(redisKey)
  log.info('testVal', testVal)
  await client.quit()
}

redisCheck(redisKey)