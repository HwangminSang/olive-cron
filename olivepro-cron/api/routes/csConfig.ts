/**
 * @swagger
 * tags:
 *  name:  customerConfig
 *  description: customerConfig
 */

import { Router } from 'express';

import { log } from '../../winston/logger';
// import { authChecker } from '../../utils/authChecker'
import { createConfig, deleteConfig, getConfig, updateCSConfig } from '../controllers/csConfig';

log.info('csConfigRouter Routers')
const csConfigRouter = Router()

// csConfigRouter.use('/', authChecker)



csConfigRouter.post('/', createConfig)

csConfigRouter.get('/:key', getConfig)

csConfigRouter.put('/', updateCSConfig)

csConfigRouter.delete('/', deleteConfig)

export default csConfigRouter
