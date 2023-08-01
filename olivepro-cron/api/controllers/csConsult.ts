'use strict'

import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import { KrCsRedisKey } from '../../redis/redisKey'
import { executeRedisCacheCheck, executeRedisGet, executeRedisSet } from '../../redis/redisUtil'
import { redisCli } from '../../utils/redis'
import { log } from '../../winston/logger'
import { CSDBError, CSParameterError, success } from '../err-codes/krCsErrorCode'
import { apiResponse } from '../../utils/apiResponse'
import { bulkSoftDelete, consultGetCount, consultPage, findAllConsult, findOneConsult, insertConsult, updateConsult } from '../mysql/cs.consult.js'

export const createConsult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('createConsult in csConsult')
    const consult = req.body

    const { id } = await insertConsult(consult)
    const data = { id }
    success.msg = 'Consult has been created success'
    res.status(201).send(apiResponse(success, data))
  } catch (error) {
    log.err(`Error : ${error} =========> createCustomerConsult in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getConsult = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    log.info('getConsult in csConsult')
    const result = await findOneConsult(id)

    //해당 id가 존재하지 않을떄.  원래 204 or 404 중에 하나를 고르는게 적합해 보입니다. 204 보낼시 아래 msg는 전달되지 않습니다. 그래서 404로 보냅니다
    if (!result) {
      log.info(`ID : ${id} is not exist in csConsult in getCustomerConsult`)
      success.msg = `ID : ${id} is not exist in csConsult`
      res.status(404).send(apiResponse(success))
      return
    }

    success.msg = 'csConsult has been found'
    res.status(200).send(apiResponse(success, result[0]))
  } catch (error) {
    log.err(`Error : ${error} =========> getConsult in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const updateCSConsult = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query
  const consult = req.body

  try {
    log.info('updateCSConsult in csConsult')
    const item = await findOneConsult(id)
    if (!item) {
      log.info(`ID : ${id} is not exist in csConsult in updateCSConsult`)

      success.msg = `ID : ${id} is not exist in csConsult`
      res.status(404).send(apiResponse(success))
      return
    }

    const [count] = await updateConsult(id, consult)
    if (count === 0) {
      log.info(`ID: ${id} update has been failed`)
      success.msg = `ID: ${id} update has been failed`
      res.status(200).send(apiResponse(success))
      return
    }

    success.msg = `ID: ${id} has been Updated`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> updateCSConsult in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const deleteConsult = async (req: Request, res: Response, next: NextFunction) => {
  log.info('deleteConsult in csConsult')
  const idList: any = req.query.idList
  const idArray: string[] = idList.split(',')
  try {
    if (idArray[0] === '') {
      log.info(`idList : ${idList}  ===> Please check your Parameter`)
      CSParameterError.msg = `Please check your Parameter idList : ${idList}`
      res.status(400).send(apiResponse(CSParameterError))
      return
    }
    const [count] = await bulkSoftDelete(idArray)

    if (count === 0) {
      success.msg = `ID: ${idList} already has been deleted in csConsult`
      res.status(200).send(apiResponse(success))
      return
    }

    success.msg = `ID: ${idList} has been Deleted`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> deleteCustomerConsult in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getConsultList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('getConsultList in csConsult')
    const result = await findAllConsult()

    success.msg = 'csConsult has been found'
    res.status(200).send(apiResponse(success, result))
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultList in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getConsultPageFilter = async (req: Request, res: Response) => {
  try {
    log.info('getConsultPage in csConsult')
    const { pageNum, limit, order, orderKeyWord } = req.query
    const { keyWord, startDate, endDate, categoryMain, categorySub, staff, csStatus } = req.body

    //동적쿼리를 위한 filter
    const filter = {
      categoryMain,
      categorySub,
      staff,
      csStatus,
    }

    const result = await consultPage(pageNum, limit, order, orderKeyWord, filter, keyWord, startDate, endDate)
    const { count, rows: list } = result
    const responseData = { count, list }

    success.msg = 'Pagination success'
    res.status(200).send(apiResponse(success, responseData))
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultPage in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getConsultCount = async (req: Request, res: Response) => {
  try {
    log.info('getConsultCount in csConsult')

    const redisKey = KrCsRedisKey.KR_CS_CONSULT_PAGE_COUNT
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const result = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(result))
      return
    }

    const today = new Date()
    const startDate = moment(today.getTime()).startOf('month').format('YYYY-MM-DD')
    const endDate = moment(today.getTime()).endOf('month').format('YYYY-MM-DD')

    const result = await consultGetCount(startDate, endDate)

    if (result != undefined || result != null) {
      success.msg = 'count success'
      executeRedisSet(redisCli, redisKey, apiResponse(success, result))
      res.status(200).json(apiResponse(success, result))
    } else res.status(404).json({ msg: 'ConsultCount invalid' })
  } catch (error) {
    log.err(`Error : ${error} =========> getConsultPage in csConsult`)
    res.status(500).send(apiResponse(CSDBError))
  }
}
