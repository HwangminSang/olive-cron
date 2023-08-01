const { createClient } = require("redis")

const str = 'redis://url'
const url = str
const option = {
  url: url
}

console.log('option', option)

const cli = createClient(option)

const test1 = "test1"
const test2 = "test2"
const test3 = "test3"

const conn = async () => {
  try {
    await cli.connect()
  } catch (err) {
    console.log('err:', err)
  }
}

const test = async () => {
  try {
    await cli.set(test1, 'result1')
    await cli.set(test2, 'result2')
    await cli.set(test3, 'result3')
    const r1 = await cli.get(test1)
    const r2 = await cli.get(test2)
    const r3 = await cli.get(test3)
    console.log('r1', r1)
    console.log('r2', r2)
    console.log('r3', r3)
  } catch (err) {
    console.log('err:', err)
  }
}
conn()
test()