'use strict'

/**
 * @swagger
 * tags:
 *  name: videoChat
 *  description: videoChat
 */

import { Router } from 'express'

import { authChecker } from '../../utils/authChecker'
import * as videoChat from '../controllers/videoChat'

const router = Router()

// router.use('/', authChecker)

router.post('/create-session', videoChat.createFromMobile)

router.post('/regen-pub-token', videoChat.regenPubToken)
router.post('/create-mod-token', videoChat.createModeratorToken)

router.get('/:id', videoChat.findOneSession)
router.get('/all-list', videoChat.findAllSession)
router.post('/filtered-list', videoChat.findByCondition)

router.post('/edit-session-progress', videoChat.editSessionProgress)

router.post('/start-archive', videoChat.startArchive)
router.post('/stop-archive', videoChat.stopArchive)

// const monitoringRouter = Router();

// monitoringRouter.post(`/${process.env.VIDEOCHAT_MNT}/session-monitoring`, videoChat.sessionMonitoring)
// monitoringRouter.post(`/${process.env.VIDEOCHAT_MNT}/archive-monitoring`, videoChat.archiveMonitoring)
module.exports = router
// exports.monitoringRouter = monitoringRouter
