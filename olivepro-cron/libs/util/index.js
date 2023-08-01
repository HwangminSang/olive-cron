'use strict'

const crypto = require('crypto')
const { log } =require('../../winston/logger')
exports.snakeCaseToCamelCase = function snakeCaseToCamelCase(word) {
  word = word.toLocaleLowerCase()
  const find = /_\w/g
  const convert = matches => matches[1].toUpperCase()
  return word.replace(find, convert)
}

exports.dotCaseToCamelCase = function dotCaseToCamelCase(word) {
  word = word.toLocaleLowerCase()
  const find = /\.\w/g
  const convert = matches => matches[1].toUpperCase()
  return word.replace(find, convert)
}

exports.getDateString = function getDateStringWithSlice({ date, sliceIndex }) {
  date = date || new Date()
  return date.toISOString().slice(0, sliceIndex)
}

exports.getLocalDateString = function getLocalDateStringWithSlice({ date, sliceIndex, timezone }) {
  date = date || new Date()
  timezone = timezone || -date.getTimezoneOffset() / 60
  date.setUTCMinutes(date.getUTCMinutes() + Number(timezone))

  return { dateLocal: date, str: date.toISOString().slice(0, sliceIndex) }
}

exports.scrapingDecrypt = (encrypted, keys) => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', keys.key, keys.iv)
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (err) {
    log.err('decrypt', err)
  }
}

exports.insertComma = number => String(number).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,')
