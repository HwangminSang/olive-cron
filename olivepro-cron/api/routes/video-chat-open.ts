'use strict'

/**
 * @swagger
 * tags:
 *  name: videoChat
 *  description: videoChat
 */

import { Router } from 'express';

import * as videoChat from '../controllers/videoChat';

const router = Router()

router.post(`/${process.env.VIDEOCHAT_MNT}/session-monitoring`, videoChat.sessionMonitoring)
router.post(`/${process.env.VIDEOCHAT_MNT}/archive-monitoring`, videoChat.archiveMonitoring)

module.exports = router
