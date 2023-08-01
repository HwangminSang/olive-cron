'use strict'

import {Router} from "express";
const { validatorErrorChecker,brainGameEmailAndAccessToken,brainGameEmail } = require('../middleware/validator');



const { createAccessTokenRedis , deleteAccessTokenRedis , getAccessTokenRedis } = require('../controllers/brainGame')



const brainGameRouter = Router()

/**
 * @swagger
 * /api/v1/game/redis:
 *     post:
 *       tags:
 *         - brain-game
 *       summary: 이메일 및 엑세스 토큰 저장
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: 'test@oliveunion.com'
 *                 accessToken:
 *                   type: string
 *                   example: '123213123123123123wdqewdwqdqwdwqqwdsfdsgd-123123123'
 *       responses:
 *         200:
 *           description: 레디스 키 생성 성공
 */


brainGameRouter.post('/', [
    ...brainGameEmailAndAccessToken,
    validatorErrorChecker
],createAccessTokenRedis)


/**
 * @swagger
 * /api/v1/game/redis:
 *   delete:
 *     tags:
 *       - brain-game
 *     summary: 이메일 통해 엑세스 토큰 삭제
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         description: 이메일
 *     responses:
 *       '200':
 *         description: 에세스 삭제 성공.
 */
brainGameRouter.delete('/',[
    ...brainGameEmail,
    validatorErrorChecker
], deleteAccessTokenRedis)



/**
 * @swagger
 * /api/v1/game/redis:
 *     get:
 *       tags:
 *         - brain-game
 *       summary: 이메일 통해 엑세스 토큰 조회
 *       parameters:
 *         - in: query
 *           name: email
 *           required: true
 *           description: 이메일
 *       responses:
 *         '200':
 *           description: 에세스 토큰 조회성공.
 */
brainGameRouter.get('/',[
    ...brainGameEmail,
    validatorErrorChecker
], getAccessTokenRedis)


export default brainGameRouter
