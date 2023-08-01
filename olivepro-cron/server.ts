const http = require('http')
const app = require('./main')
const port = process.env.PORT || 3000

const server = http.createServer(app)

import { log } from './winston/logger';

server.listen(port, () => {
  log.info(`Server is running on port ${port}. => http://localhost:${port}`)
})
