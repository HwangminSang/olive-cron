'use strict'

const { csConsult, csCustomer } = require('../models')
const handler = require('../../libs/util/mysql/handler')(csConsult)
const { log } = require('../../winston/logger')
const Op = require('../../api/models').Sequelize.Op
const Sequelize = require('../../api/models').Sequelize
const { startDateChangeUtcTime, endDateChangeUtcTime, endDateChangeSameTime } = require('../../utils/changeTime')
exports.findAllConsult = async () => {
  log.info('all in findAllConsult')
  const consult = await handler.findAll({
    where: { usable: 1 },
    order: [['updated_at', 'DESC']],
  })

  if (consult === undefined) return false
  return consult
}

/**
 * customerConsult
 */

exports.insertConsult = async consult => {
  log.info('create in insertConsult')

  try {
    return await handler.create(consult)
  } catch (error) {
    throw new Error(error)
  }
}

exports.findOneConsult = async id => {
  log.info('find in findOneConsult')
  const consult = await handler.findOne({ where: { id, usable: 1 } })

  if (consult.length === 0) return false
  return consult
}

exports.updateConsult = async (id, consult) => {
  log.info('Update in updateConsult')

  const option = {
    where: { id, usable: 1 },
    value: consult,
  }
  try {
    return await handler.update(option)
  } catch (error) {
    throw new Error(error)
  }
}

exports.bulkSoftDelete = async idArray => {
  log.info('Delete in bulkSoftDelete')

  try {
    return await handler.bulkSoftDelete(idArray)
  } catch (error) {
    throw new Error(error)
  }
}

exports.deleteConsult = async id => {
  log.info('delete in deleteConsult')
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

// 상담 페이지 카운트
exports.consultGetCount = async (startDate, endDate) => {
  log.info('consultGetCount in consultGetCount')

  try {
    // 12월 기준 -> BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00'
    //SELECT count(*) AS `count` FROM `cs_consult` AS `cs_consult` WHERE `cs_consult`.`usable` = 1 AND `cs_consult`.`cs_status` = 1 AND `cs_consult`.`created_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00';
    const reservedCount = await csConsult.count({
      where: {
        usable: 1,
        csStatus: 1, // 예약
        createdAt: { [Op.between]: [startDate, endDate] },
      },
    })
    //SELECT count(*) AS `count` FROM `cs_consult` AS `cs_consult` WHERE `cs_consult`.`usable` = 1 AND `cs_consult`.`cs_status` = 2 AND `cs_consult`.`created_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00'
    const completionCount = await csConsult.count({
      where: {
        usable: 1,
        csStatus: 2, // 완료
        createdAt: { [Op.between]: [startDate, endDate] },
      },
    })

    //SELECT `category_sub` AS `categorySub`, count('*') AS `count` FROM `cs_consult` AS `cs_consult` WHERE `cs_consult`.`usable` = 1 AND `cs_consult`.`category_main` = '일반문의' AND `cs_consult`.`created_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00' GROUP BY `categorySub`
    const categoryMainGeneralInquiry = await csConsult.findAll({
      where: {
        usable: 1,
        categoryMain: '일반문의', //  일반문의
        createdAt: { [Op.between]: [startDate, endDate] },
      },

      attributes: ['categorySub', [Sequelize.fn('count', '*'), 'count']],
      group: 'categorySub',
      raw: true,
    })

    //SELECT `category_sub` AS `categorySub`, count('*') AS `count` FROM `cs_consult` AS `cs_consult` WHERE `cs_consult`.`usable` = 1 AND `cs_consult`.`category_main` = '클레임' AND `cs_consult`.`created_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00' GROUP BY `categorySub`
    const categoryMainClaim = await csConsult.findAll({
      where: {
        usable: 1,
        categoryMain: '클레임',
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['categorySub', [Sequelize.fn('count', '*'), 'count']],
      group: 'categorySub',
      raw: true,
    })

    let generalInquiry = null
    if (categoryMainGeneralInquiry[0] !== undefined) {
      generalInquiry = categoryMainGeneralInquiry.reduce((prev, value) => {
        return prev.count >= value.count ? prev : value
      })
    }

    let mainClaim = null
    if (categoryMainClaim[0] !== undefined) {
      mainClaim = categoryMainClaim.reduce((prev, value) => {
        return prev.count >= value.count ? prev : value
      })
    }
    const result = {
      generalInquiry,
      mainClaim,
      reservedCount,
      completionCount,
    }

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// 상담 페이지
exports.consultPage = async (pageNum, limit, order, orderKeyWord, filter, keyWord, startDate, endDate) => {
  log.info('page in ConsultPage')

  const page = pageNum === undefined ? 1 : pageNum
  const sort = order === 'ASC' ? 'ASC' : 'DESC'
  const checkLimit = limit === undefined ? 10 : parseInt(limit)
  const keyWordOrder = orderKeyWord === undefined ? 'id' : orderKeyWord

  let offset = 0
  if (page > 1) {
    offset = checkLimit * (page - 1)
  }
  try {
    return await csConsult.findAndCountAll({
      include: [{ model: csCustomer, attributes: ['id', 'phoneNumber', 'name'], where: csCustomerKeyWordCondition(keyWord) }],
      attributes: ['id', 'consultDate', 'categoryMain', 'categorySub', 'content', 'staff', 'reservedAt', 'csStatus'],
      where: {
        ...consultDateCondition(startDate, endDate),
        [Op.and]: [consultCondition(filter)],
      },
      order: [[keyWordOrder, sort]],
      offset,
      limit: checkLimit,
      raw: true, // 조인된 테이블의 칼럼을 하나의 객체에 필드값으로 보내게 설정
    })
  } catch (error) {
    throw new Error(error)
  }
}

//동적쿼리 function  ( customer name , phoneNumber  like 검색 )
const csCustomerKeyWordCondition = keyWord => {
  let csCustomerKeyWordCondition = {}

  if (keyWord !== 'all') {
    csCustomerKeyWordCondition = {
      [Op.or]: [
        {
          name: {
            [Op.substring]: keyWord,
          },
        },
        {
          phoneNumber: {
            [Op.substring]: keyWord,
          },
        },
      ],
    }
  }

  return csCustomerKeyWordCondition
}

//동적쿼리 function  ( consult.consultDate 예약시간 검색 )
const consultDateCondition = (startDate, endDate) => {
  let consultDate = {}

  if (startDate !== 'all' && endDate !== 'all') {
    //동일날자 일경우
    if (startDate === endDate) {
      consultDate.consultDate = {
        //ex)  10/12 ~ 10/12 ->  BETWEEN '2021-10-11 15:00:00' AND '2021-10-12 15:00:00'
        [Op.between]: [startDateChangeUtcTime(startDate), endDateChangeSameTime(endDate)],
      }
      return consultDate
    }

    consultDate.consultDate = {
      //ex)  10/12 ~ 10/14 -> BETWEEN '2021-10-11 15:00:00' AND '2021-10-13 15:00:00'
      [Op.between]: [startDateChangeUtcTime(startDate), endDateChangeUtcTime(endDate)],
    }
  }

  return consultDate
}

// 동적쿼리 function  ( consult , 대분류 , 중분류 , 스탭 , csStatus)
const consultCondition = filter => {
  //조건 담는 곳
  let condition = {
    usable: 1, // 삭제 되지 않은것만
  }

  // 기타 조건 담는곳
  Object.keys(filter).map(key => {
    if (filter[key] !== 'all') {
      condition[key] = filter[key]
    }
  })

  return condition
}
