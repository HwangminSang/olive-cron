'use strict'

const { env } = require('./index')

/**
 * Common configuration
 * This is common configuration file which is used as a skeletone of config.
 */
module.exports = {
  isTest: env.NODE_ENV === 'test' || env.NODE_ENV === 'develop',

  env: env.NODE_ENV || 'test',

  port: env.PORT || 5000,
}
