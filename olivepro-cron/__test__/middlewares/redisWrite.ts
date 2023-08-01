import { createClient } from 'redis';

const redisKey = "821051246325"

const client = createClient()

const redisWrite = async (redisKey: string) => {
  await client.connect();
  console.log('redisKey', redisKey)
  const valStr: string = await client.get(redisKey) || "0"
  console.log('valStr', valStr)
  const newNum = parseInt(valStr) + 1
  console.log('newNum', newNum)
  const newVal = newNum.toString()
  console.log('newVal', newVal)
  client.set(redisKey, newVal, {
    EX: 5,
  })
  await client.quit()
}

redisWrite(redisKey)

