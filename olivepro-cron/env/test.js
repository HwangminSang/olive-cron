'use strict'

const { env } = require('./index')

module.exports = {
  isTest: true,
  debug: true,
  clustering: false,
  logOptions: {
    level: 'info',
    colorize: true,
  },
  makeTable: true,

  mysql: {
    username: 'admin',
    password: 'testOliveRds0704*',
    database: 'olivepro_test',
    host: env.MYSQL_HOST || 'test-olivernd-mysql.coluvj80rday.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    dialect: 'mysql',
    pool: {
      min: 0,
      max: 5,
      idle: 10000,
      acquire: 30000,
    },
    // operatorsAliases: false,
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci',
      },
    },
  },
}
