import { Request, Response } from 'express';

import { redisCli } from '../../utils/redis';
import { redisKeyNumPlus, vonageVerify } from '../../utils/verifyUtils';
import { log } from '../../winston/logger';
import {
    ErrorObject, noRequestIdErr, notMatchedIdErr, wrongCodeLimitErr
} from '../err-codes/changePhoneCode';
import { phoneApiErr } from '../err-codes/verifyCount';

export const checkVerifyCode = async (req: Request, res: Response) => {
  const { requestId, code } = req.body
  const redisPhoneKey = await redisCli.get(requestId)
  if (redisPhoneKey === null || requestId === null || requestId === undefined) {
    res.send({
      code: -2019,
      msg: `A verify check request came in with an invalid requestId`,
      success: false,
    })
    log.err(`A verify check request came in with an invalid requestId`)
    return
  }
  const attemptCountKey = 'attempt:' + requestId
  const attemptCount = await redisKeyNumPlus(attemptCountKey, 300)
  const ErrArray: Array<ErrorObject> = [phoneApiErr, noRequestIdErr, notMatchedIdErr, wrongCodeLimitErr]
  ErrArray.map(
    ErrObj =>
      (ErrObj.data = {
        attemptCount: attemptCount,
      })
  )
  if (parseInt(attemptCount) > 3) {
    log.err('The wrong code was provided too many times in checkVerifyCode')
    res.send(wrongCodeLimitErr)
  }
  try {
    vonageVerify.verify.check(
      {
        request_id: requestId,
        code,
      },
      (err: any, verifyResp: any) => {
        if (verifyResp.status === '0') {
          log.info(`Vonage verify request succeeded phone : ${redisPhoneKey} in checkVerifyCode`)
          redisCli.del(attemptCountKey)
          redisCli.del(redisPhoneKey)
          res.send({
            code: 200,
            msg: 'VerifyCode checked successfully.',
            success: true,
          })
        } else if (verifyResp.status === '101') {
          log.err('No request found in checkVerifyCode')
          res.send(noRequestIdErr)
        } else if (verifyResp.status === '16') {
          log.err('The code provided does not match the expected value in checkVerifyCode')
          res.send(notMatchedIdErr)
        } else if (verifyResp.status === '17') {
          log.err('The wrong code was provided too many times in checkVerifyCode')
          res.send(wrongCodeLimitErr)
        } else {
          log.err(`vonage.verify.check.api Error: ${err} in checkVerifyCode`)
          res.send(phoneApiErr)
        }
      }
    )
  } catch (err: any) {
    log.err(`err :${err} in checkVerifyCode`)
    res.send(phoneApiErr)
  }
}

export default checkVerifyCode
