const { createClient } = require('redis')
const { log } = require('../winston/logger');

(async () => {
  const client = createClient()

  client.on('error', err =>log.err('Redis Client Error', err))

  await client.connect()

  let tempObject = {
    text1: 'hi',
    text2: 'salut',
    number: 1,
    date: new Date(),
  }

  await client.hSet('test1', 'target_id', JSON.stringify(tempObject))
  const value = await client.hGet('test1', 'target_id', (err, obj) => {
    obj = JSON.parse(obj)
    log.info(obj)
  })

  const result = await client.expire(value, 10)

  log.info(result)

  client.quit()
})()
