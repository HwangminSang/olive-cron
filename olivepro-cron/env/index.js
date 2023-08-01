'use strict'

const { env } = process

exports.toNumber = function toNumberWithDefaultValue(value, defaultValue) {
  if (value && typeof value === 'object') {
    const { value: v, defaultValue: dv } = value
    value = v
    defaultValue = dv
  }

  if (!defaultValue) defaultValue = 0

  return isNaN(value) ? defaultValue : Number(value)
}

// Make environment variable change by passing arguments
process.argv.forEach(arg => {
  const eq = arg.split('=')
  if (eq.length > 1) {
    ;[, env[eq[0]]] = eq
  }
})

exports.env = env

const e = process.env.NODE_ENV
let config = {}

try {
  config = require(`./${e}`) // eslint-disable-line global-require
} catch (err) {
  config = {}
}

config = Object.assign(require('./common'), config)

exports.config = config
