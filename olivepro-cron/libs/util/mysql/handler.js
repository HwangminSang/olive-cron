'use strict'

const { sequelize, Sequelize } = require('../../../api/models')
const { log } = require('../../../winston/logger')

const buildOptions = ({ where, attributes, length, transaction, order, offset }) => {
  const options = { where }

  if (transaction) {
    options.transaction = transaction
  }

  if (length && length > 1) {
    options.limit = length
  }

  if (attributes && attributes.length) {
    options.attributes = attributes
  }

  if (order && order.length) {
    options.order = order
  }

  if (offset && offset > 1) {
    options.offset = offset
  }

  return options
}

const queryFunc = async ({ model, where, attributes, length, transaction, order }) => {
  const options = buildOptions({
    where,
    attributes,
    length,
    transaction,
    order,
  })

  if (length === 1) {
    const data = await model.findOne(options)
    return data ? data.dataValues : undefined
  }

  const data = await model.findAll(options)
  if (!data) return []

  return data.map(l => l.dataValues)
}

const updateFunc = async ({ model, where, value, transaction }) => {
  const options = { where }
  if (transaction) options.transaction = transaction
  try {
    const count = await model.update(value, { where, transaction })

    if (count.length && count[0] === 0) {
    }
  } catch (err) {
    return Promise.reject([new new Error()(), err])
  }
}

const updateFuncWithoutcheck = async ({ model, where, value, transaction }) => {
  const options = { where }

  if (transaction) options.transaction = transaction

  try {
    const count = await model.update(value, { where, transaction })
    log.info(`updateFuncWithoutcheck ===> count : ${count}`)
    return count
  } catch (err) {
    return console.log(err)
  }
}

module.exports = model => ({
  findAll: async params => {
    params = { ...(params || {}), model }

    return queryFunc(params)
  },

  findOne: async params => {
    params = { ...(params || {}), model, limit: 1 }

    return queryFunc(params)
  },

  findOrCreate: async params => {
    try {
      return model.findOrCreate(params)
    } catch (err) {
      // eslint-disable-next-line no-undef
      return Promise.reject([new DbError(), err])
    }
  },

  query: async params => {
    if (!params) params = {}
    const { where, attributes, length, transaction, order } = params

    return queryFunc({
      model,
      where,
      attributes,
      length,
      transaction,
      order,
    })
  },

  get: async ({ where, attributes, transaction }) =>
    queryFunc({
      model,
      where,
      attributes,
      length: 1,
      transaction,
    }),

  put: async (item, transaction) => {
    if (transaction) return model.create(item, { transaction })
    return model.create(item)
  },

  puts: async (items, transaction) => {
    if (transaction) return model.bulkCreate(items, { transaction })
    return model.bulkCreate(items)
  },

  updateWithoutCheck: async ({ where, value, transaction }) =>
    updateFuncWithoutcheck({
      model,
      where,
      value,
      transaction,
    }),

  increase: async ({ where, params, transaction }) => {
    const value = {}

    Object.keys(params).forEach(k => {
      value[k] = sequelize.literal(`\`${k}\` + ${params[k]}`)
    })

    return updateFunc({
      model,
      where,
      value,
      transaction,
    })
  },

  delete: async (where, transaction) => {
    try {
      if (transaction) return model.destroy({ where, transaction })
      return model.destroy({ where })
    } catch (err) {
      throw new Error(err)
    }
  },

  create: async item => {
    try {
      const result = await model.create(item)
      return result
    } catch (err) {
      throw new Error(err)
    }
  },

  update: async ({ where, value, transaction }) => {
    try {
      const count = await model.update(value, { where })

      return count
    } catch (err) {
      throw new Error(err)
    }
  },

  bulkSoftDelete: async idArray => {
    try {
      const count = await model.update(
        { usable: 0 },
        {
          where: {
            id: { [Sequelize.Op.in]: idArray },
          },
        }
      )

      return count
    } catch (err) {
      throw new Error(err)
    }
  },

  findOneCron: async () => {
    try {
      const dateTimeNow = new Date()
      const result = await model.findOne({
        where: { usable: 1, reserveStatus: 1, reserveDateTime: { [Sequelize.Op.lte]: dateTimeNow } },
        order: [['updated_at', 'DESC']],
        length: 1,
      })
      return result
    } catch (err) {
      throw new Error(err)
    }
  },

  findPage: async (offset, checkLimit, sort, keyWord) => {
    try {
      const result = await model.findAndCountAll({
        where: { usable: 1 }, // 삭제 되지 않은것만
        order: [[keyWord, sort]],
        offset: offset,
        limit: checkLimit,
      })

      return result
    } catch (err) {
      throw new Error(err)
    }
  },

  findKeyWordPage: async (offset, checkLimit, sort, keyWord, search, searchValue) => {
    try {
      const result = await model.findAndCountAll({
        where: { [search]: searchValue, usable: 1 },
        order: [[keyWord, sort]],
        offset: offset,
        limit: checkLimit,
      })

      return result
    } catch (err) {
      throw new Error(err)
    }
  },

  truncate: async () => model.truncate(),
})
