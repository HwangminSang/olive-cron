'use strict'

const { csCustomer, csOrder, csConsult } = require('../models')
const handler = require('../../libs/util/mysql/handler')(csCustomer)
const { log } = require('../../winston/logger')

exports.findAllCustomer = async () => {
  log.info('all in findAllCustomer')
  const customer = await handler.findAll({
    where: { usable: 1 },
    order: [['updated_at', 'DESC']],
  })

  if (customer === undefined) return false
  return customer
}

/**
 * Customer
 */

exports.insertCustomer = async customer => {
  log.info('create in insertCustomer')

  try {
    return await handler.create(customer)
  } catch (error) {
    throw new Error(error)
  }
}

exports.findOneCustomer = async id => {
  log.info('find in findOneCustomer')
  const customer = await handler.findOne({ where: { id, usable: 1 } })

  if (customer.length === 0) return false
  return customer
}

exports.existCustomer = async (name, phoneNumber) => {
  log.info('find in existCustomer')
  const customer = await handler.findOne({ where: { name, phoneNumber } })

  if (customer.length === 0) return false
  return customer
}

exports.updateCustomer = async (id, customer) => {
  log.info('Update in updateCustomer')

  const option = {
    where: { id, usable: 1 },
    value: customer,
  }
  try {
    return await handler.update(option)
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

exports.deleteCustomer = async id => {
  log.info('delete in deleteCustomer')
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

exports.customerPage = async (pageNum, limit, order, orderKeyWord, search, searchValue) => {
  log.info('page in customerPage')

  const page = pageNum === undefined ? 1 : pageNum
  const sort = order === 'ASC' ? 'ASC' : 'DESC'
  const checkLimit = limit === undefined ? 10 : limit
  const keyWord = orderKeyWord === undefined ? 'id' : orderKeyWord

  log.info(search + ' => ' + searchValue)
  let offset = 0
  if (page > 1) {
    offset = checkLimit * (page - 1)
  }
  try {
    return search != undefined && searchValue != undefined
      ? handler.findKeyWordPage(offset, parseInt(checkLimit), sort, keyWord, search, searchValue)
      : handler.findPage(offset, parseInt(checkLimit), sort, keyWord)
  } catch (error) {
    throw new Error(error)
  }
}

// 즉시로딩 상태로 연관된 모델들을 바로 들고옵니다.  (LEFT OUTER JOIN)
exports.findOneCustomerWithOrderAndConsult = async id => {
  log.info('findOneCustomerWithOrderAndConsult in findOneCustomerWithOrderAndConsult')
  try {
    const result = await csCustomer.findAll({
      where: { id, usable: 1 },
      attributes: { exclude: ['createdAt', 'updatedAt', 'usable'] },
      include: [
        {
          model: csOrder,
          required: false, // 사용자가 주문을 하지 않았을경우 inner join을 하면 오류가 생김. 그래서 left outer join으로 설정하여 빈 배열을 반환
          where: { usable: 1 },
          attributes: { exclude: ['createdAt', 'updatedAt', 'usable'] },
        },
        {
          model: csConsult,
          required: false, // 사용자가 주문을 하지 않았을경우 inner join을 하면 오류가 생김. 그래서 left outer join으로 설정하여 빈 배열을 반환
          where: { usable: 1 },
          attributes: { exclude: ['createdAt', 'updatedAt', 'usable'] },
        },
      ],
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}
