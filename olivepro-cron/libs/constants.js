'use strict'

const addPrefix = name => {
  let prefix = ''
  if (process.env.NODE_ENV === 'production') return name
  else if (process.env.NODE_ENV === 'qa') prefix = 'qa'
  else prefix = 'test'

  if (name.indexOf('.') !== -1) return `${prefix}.${name}`
  else if (name.indexOf('_') !== -1) return `${prefix}_${name}`
  return `${prefix}-${name}`
}

exports.TableName = Object.freeze({
  ACCOUNT_LOG: addPrefix('olive.account.log'),
  DAILY_LOG: addPrefix('olive.daily.log'),
})



exports.SmsStatus = Object.freeze({
  Ready: 0,
  ProcessStart: 1, // 진행
  ProcessEnd: 2, // 완료
  Complete: 3, // 종료
  Expired: 4, // 만료
  Cancell: 5, // 취소
  Error: 9,
})












