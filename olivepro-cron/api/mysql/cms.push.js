'use strict'

const sequelize = require('sequelize')
const { cmsPush } = require('../models')
const handler = require('../../libs/util/mysql/handler')(cmsPush)
const { log } = require('../../winston/logger')

exports.findOneCMSPushInfo = async () => {
  const push = await handler.findOne({
    attributes: ['id', 'type', 'send_type', 'country', 'os', 'title', 'message', 'url_link', 'reserve_date_time', 'pushed_date_time', 'reserve_status', 'usable', 'author'],
    where: { usable: 1, reserveStatus: 1 },
    order: [['updated_at', 'DESC']],
    length: 1,
  })

  if (push === undefined) return false
  return push
}

exports.findToBeSendCMS = async () => {
  log.info('find one FCM push in findToBeSendCMS')

  const push = await handler.findOneCron()

  if (push === undefined) return false
  return push
}
exports.findOnePushInfoByDate = async (startDate, endDate) => {
  log.info('all in findOnePushInfoByDate')
  const push = await handler.findOne({
    attributes: ['id', 'type', 'send_type', 'country', 'os', 'title', 'message', 'url_link', 'reserve_date_time', 'pushed_date_time', 'reserve_status', 'usable', 'author'],
    where: {
      usable: 1,
      reserveDateTime: {
        [sequelize.Op.between]: [startDate, endDate],
      },
      reserveStatus: 1,
    },
    order: [['reserve_date_time', 'ASC']],
    length: 1,
  })

  if (push === undefined) return false
  return push
}

exports.findAllPushInfo = async () => {
  log.info('all in findAllPushInfo')
  const push = await handler.findAll({
    where: { usable: 1 },
    order: [['updated_at', 'DESC']],
  })

  if (push === undefined) return false
  return push
}

/**
 * 푸시 발송 진행 상태 및 완료 시간 업데이트
 * @param id
 * @param roundNumber
 * @param reserve_status
 * @returns {Promise<*>}
 */

exports.updatePushReserveStatus = async ({ id }, reserveStatus) => {
  const push = await handler.updateWithoutCheck({
    value: {
      reserveStatus,
      pushedDateTime: new Date(),
      updated_at: new Date(),
    },
    where: { id, usable: 1 },
  })

  return push
}

// cmsPush
// 등록
exports.createPushInfo = async push => {
  log.info('create in createPushInfo')

  try {
    return await handler.create(push)
  } catch (error) {
    throw new Error(error)
  }
}
//조회
exports.findOneCmsPush = async id => {
  log.info('find in findOneCmsPush')
  const push = await handler.findOne({ where: { id } })

  if (push.length === 0) return false
  return push
}
//업데이트
exports.UpdateOneCmsPush = async (id, push) => {
  log.info('Update in UpdateOneCmsPush')

  const opiton = {
    where: { id },
    value: push,
  }
  try {
    return await handler.update(opiton)
  } catch (error) {
    throw new Error(error)
  }
}

exports.bulkSoftDelete = async idArrray => {
  log.info('Delete in bulkSoftDelete')

  try {
    return await handler.bulkSoftDelete(idArrray)
  } catch (error) {
    throw new Error(error)
  }
}

exports.deletePushInfo = async id => {
  log.info('delete in deletePushInfo')
  const where = { id }
  try {
    const result = await handler.delete(where)
    if (!result) {
      return false
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

exports.PushPage = async (pageNum, limit, order, orderKeyWord) => {
  log.info('page in PushPage')

  const page = pageNum === undefined ? 1 : pageNum
  const sort = order === 'ASC' ? 'ASC' : 'DESC'
  const checkLimit = limit === undefined ? 10 : limit
  const keyWord = orderKeyWord === undefined ? 'id' : orderKeyWord

  let offset = 0
  if (page > 1) {
    offset = checkLimit * (page - 1)
  }
  try {
    return handler.findPage(offset, parseInt(checkLimit), sort, keyWord)
  } catch (error) {
    throw new Error(error)
  }
}

/** 성공 카운트 , 실패 카운트 업데이트 **/
exports.UpdateCountCmsPush = async (id, successCount, failCount) => {
  const push = { successCount, failCount }
  const option = {
    where: { id },
    value: push,
  }
  log.info('UpdateCountCmsPush in UpdateOneCmsPush')
  log.info(`id :${id}  ======= ${JSON.stringify(push)}`)
  try {
    return await handler.update(option)
  } catch (error) {
    throw new Error(error)
  }
}
