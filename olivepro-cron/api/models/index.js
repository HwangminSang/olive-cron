// 'use strict';

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const { dbPoolProp } = require('../../db/config')

const baseName = path.basename(__filename)
const { snakeCaseToCamelCase } = require('../../libs/util')

const sequelize = new Sequelize(dbPoolProp.database, dbPoolProp.user, dbPoolProp.password, {
  host: dbPoolProp.host,
  dialect: 'mysql',
  // operatorsAliases: false,
  pool: {
    min: 0,
    max: 5,
    acquire: 30000,
    idle: 10000,
  },
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

fs.readdirSync(__dirname).forEach(file => {
  if (path.extname(file) === '.js' && file !== baseName) {
    const filePath = path.join(__dirname, file)
    const r = require(filePath) // eslint-disable-line global-require
    if (r) {
      const model = sequelize.import(filePath, r)
      db[snakeCaseToCamelCase(model.name)] = model
    }
  }
})

// associate 제대로 동작 하지 않음.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associcate) db[modelName].associate(db)
})

//if (process.env.NODE_ENV === 'develop') {
  db['csOrder'].associate(db)
  db['csCustomer'].associate(db)
  db['csConsult'].associate(db)
//}

module.exports = db
