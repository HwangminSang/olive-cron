'use strict'

import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import { KrCsRedisKey } from '../../redis/redisKey'
import { executeRedisCacheCheck, executeRedisGet, executeRedisSet } from '../../redis/redisUtil'
import { redisCli } from '../../utils/redis'
import { log } from '../../winston/logger'
import { CSDBError, CSParameterError, noExistError, success } from '../err-codes/krCsErrorCode'
import { bulkSoftDelete, findAllOrder, findOneOrder, insertOrder, orderGetCount, orderPage, updateOrder } from '../mysql/cs.order.js'
import { apiResponse } from '../../utils/apiResponse'
import { google } from '@google-analytics/data/build/protos/protos'
export const getConsultCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = KrCsRedisKey.KR_CS_ORDER_PAGE_COUNT
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const result = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(result))
      return
    }

    log.info('getConsultCount in csOrder')

    // TODO: 현재는 UTC
    const startDate = moment().startOf('month').format('YYYY-MM-DD')
    const endDate = moment().endOf('month').format('YYYY-MM-DD')

    const result = await orderGetCount(startDate, endDate)

    if (result != undefined || result != null) {
      success.msg = 'count success'
      executeRedisSet(redisCli, redisKey, apiResponse(success, result))
      res.status(200).json(apiResponse(success, result))
    } else res.status(404).json({ msg: 'orderCount invalid' })
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultList in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

/**
 * 주문 등록
 * @param req
 * @param res
 * @param next
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('createOrder in csOrder')
    const consult = req.body

    const { id } = await insertOrder(consult)
    const data = { id }
    success.msg = 'Order has been created'
    res.status(201).send(apiResponse(success, data))
  } catch (error) {
    log.err(`Error : ${error} =========> createOrder in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

/**
 * 주문 한개 조회
 * @param req
 * @param res
 * @param next
 */
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    log.info('getOrder in csOrder')
    const result = await findOneOrder(id)

    //해당 id가 존재하지 않을떄.  원래 204 or 404 중에 하나를 고르는게 적합해 보입니다. 204 보낼시 아래 msg는 전달되지 않습니다. 그래서 404로 보냅니다
    if (!result) {
      log.err(`ID : ${id} is not exists in getOrder`)
      noExistError.msg = `ID : ${id} is not exists`
      res.status(404).send(apiResponse(noExistError))
      return
    }
    success.msg = 'csOrder has been found'
    res.status(200).send(apiResponse(success, result[0]))
  } catch (error) {
    log.err(`Error : ${error} =========> getOrder in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

/**
 * 주문 업데이트
 * @param req
 * @param res
 * @param next
 */
export const updateCSOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query
  const order = req.body

  try {
    log.info('updateCSOrder in csOrder')
    const item = await findOneOrder(id)
    if (!item) {
      noExistError.msg = `ID : ${id} is not exists in csOrder`
      log.err(`ID : ${id} is not exists in csOrder`)
      res.status(404).send(apiResponse(noExistError))
      return
    }

    const [count] = await updateOrder(id, order)

    if (count === 0) {
      success.msg = `ID: ${id} has been failed in csOrder`
      res.status(200).send(apiResponse(success))
      return
    }
    success.msg = `ID: ${id} has been Updated`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> updateCSOrder in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  log.info('deleteOrder in csOrder')
  const idList: any = req.query.idList
  const idArray: string[] = idList.split(',')
  try {
    if (idArray[0] === '') {
      log.info(`idList : ${idList}  ===> Please check your Parameter`)
      CSParameterError.msg = `Please check your Parameter`
      res.status(400).send(apiResponse(CSParameterError))
      return
    }
    const [count] = await bulkSoftDelete(idArray)

    if (count === 0) {
      success.msg = `ID: ${idList} already has been deleted`
      res.status(200).send(apiResponse(success))
      return
    }
    success.msg = `ID: ${idList} has been Deleted`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> deleteOrder in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('getOrderList in csOrder')
    const result = await findAllOrder()

    success.msg = 'csOrder has been found'
    res.status(200).send(apiResponse(success, result))
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultList in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getOrderPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('getOrderPage in csOrder')
    const { pageNum, limit, order, orderKeyWord } = req.query

    const { keyWord, startDate, endDate, shopName, product, returnType, returnReason } = req.body

    //동적쿼리를 위한 filter
    const filter = {
      //구매경로 ,제품명 , 반품 or 교환 or AS ,반품사유
      shopName,
      product,
      returnType,
      returnReason,
    }

    const result = await orderPage(pageNum, limit, order, orderKeyWord, keyWord, startDate, endDate, filter)
    const { count, rows: list } = result
    const responseData = { count, list }

    success.msg = 'Pagination success'

    res.status(200).send(apiResponse(success, responseData))
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultPage in csOrder`)
    res.status(500).send(apiResponse(CSDBError))
  }
}
