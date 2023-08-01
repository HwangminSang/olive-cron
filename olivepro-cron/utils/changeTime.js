const moment = require('moment')

/**
 * 페이지 날짜 타입변경  22/12/12 -> 2022-12-12 00:00:00
 * @param date
 */
exports.startDateChangeTime = date => {
  const year = date.substring(0, 2).padStart(4, '20')
  const month = date.substring(3, 5)
  const day = date.substring(6, 8)

  return Date.parse(`${year}-${month}-${day}`)
}

/**
 * 페이지 날짜 타입변경  22/12/13 ->  2022-12-14  -> 2022-12-13 23:59:59
 * @param date
 */

exports.endDateChangeTime = date => {
  const year = date.substring(0, 2).padStart(4, '20')
  const month = date.substring(3, 5)
  const day = parseInt(date.substring(6, 8)) + 1

  const endDate = moment(Date.parse(`${year}-${month}-${day}`)).subtract(1, 's')

  return endDate
}

/**
 * 페이지 날짜 타입변경  22/12/12 -> 2022-12-11 15:00:00
 * @param date
 */
exports.startDateChangeUtcTime = date => {
  const year = date.substring(0, 2).padStart(4, '20')
  const month = date.substring(3, 5)
  const day = date.substring(6, 8)

  return `${year}-${month}-${day}`
}

/**
 * 페이지 날짜 타입변경  22/12/13 ->  2022-12-12 15:00:00
 * @param date
 */

exports.endDateChangeUtcTime = date => {
  const year = date.substring(0, 2).padStart(4, '20')
  const month = date.substring(3, 5)
  const day = parseInt(date.substring(6, 8))

  return `${year}-${month}-${day}`
}

/**
 * 페이지 날짜 타입변경  22/12/12 ->   2022-12-12 15:00:00
 * @param date
 */

exports.endDateChangeSameTime = date => {
  const year = date.substring(0, 2).padStart(4, '20')
  const month = date.substring(3, 5)
  const day = parseInt(date.substring(6, 8)) + 1

  return `${year}-${month}-${day}`
}
