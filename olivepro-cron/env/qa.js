'use strict'

const { env } = require('./index')

module.exports = {
  isTest: true,
  debug: false,
  clustering: true,
  logOptions: {
    level: 'warn',
    colorize: false,
  },
  makeTable: false, // Test와 DB 분리로 인해 로컬에서 생성해줘야만 함. 생성시에만 true로 만들고 원본은 항상 false로 저장하도록! 주의!

  mysql: {
    username: 'admin',
    password: 'testOliveRds0704*',
    database: 'olivepro_qa',
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
//
