'use strict'

exports.GaRedisKey = Object.freeze({
  COUNTRY_TOTAL: 'CRON_COUNTRY_TOTAL',
  ACTIVE_USER_PER_DAY: 'CRON_ACTIVE_USER_PER_DAY',
  ACTIVE_USER_ALL_ONE_YEAR: 'CRON_ACTIVE_USER_ALL_ONE_YEAR',
  ACTIVE_USER_KOREA_ONE_YEAR: 'CRON_ACTIVE_USER_KOREA_ONE_YEAR',
  ACTIVE_USER_JAPAN_ONE_YEAR: 'CRON_ACTIVE_USER_JAPAN_ONE_YEAR',
  ACTIVE_USER_US_ONE_YEAR: 'CRON_ACTIVE_USER_US_ONE_YEAR',
  ACTIVE_USER_ALL_TWELVE_WEEKS_AGO: 'CRON_ACTIVE_USER_ALL_TWELVE_WEEKS_AGO',
  ACTIVE_USER_KOREA_TWELVE_WEEKS_AGO: 'CRON_ACTIVE_USER_KOREA_TWELVE_WEEKS_AGO',
  ACTIVE_USER_JAPAN_TWELVE_WEEKS_AGO: 'CRON_ACTIVE_USER_JAPAN_TWELVE_WEEKS_AGO',
  ACTIVE_USER_US_TWELVE_WEEKS_AGO: 'CRON_ACTIVE_USER_US_TWELVE_WEEKS_AGO',
  ACTIVE_USER_ALL_AGE_RANGE: 'CRON_ACTIVE_USER_ALL_AGE_RANGE',
  ACTIVE_USER_KOREA_AGE_RANGE: 'CRON_ACTIVE_USER_KOREA_AGE_RANGE',
  ACTIVE_USER_JAPAN_AGE_RANGE: 'CRON_ACTIVE_USER_JAPAN_AGE_RANGE',
  ACTIVE_USER_US_AGE_RANGE: 'CRON_ACTIVE_USER_US_AGE_RANGE',
  ACTIVE_USER_ALL_GENDER_COUNT: 'CRON_ACTIVE_USER_ALL_GENDER_COUNT',
})

exports.KrCsRedisKey = Object.freeze({
  KR_CS_ORDER_PAGE_COUNT: 'CRON_KR_CS_ORDER_PAGE_COUNT',
  KR_CS_CONSULT_PAGE_COUNT: 'CRON_KR_CS_CONSULT_PAGE_COUNT',
})

exports.BrainGameRedisKey = Object.freeze({
  BRAIN_GAME_ACCESS_TOKEN: 'CRON_BRAIN_GAME_ACCESS_TOKEN',
})

exports.RedisKeyExpire = Object.freeze({
  CRON_COUNTRY_TOTAL: { EX: 1800 },
  CRON_ACTIVE_USER_PER_DAY: { EX: 1800 },
  CRON_ACTIVE_USER_ALL_ONE_YEAR: { EX: 1800 },
  CRON_ACTIVE_USER_KOREA_ONE_YEAR: { EX: 1800 },
  CRON_ACTIVE_USER_JAPAN_ONE_YEAR: { EX: 1800 },
  CRON_ACTIVE_USER_US_ONE_YEAR: { EX: 1800 },
  CRON_ACTIVE_USER_ALL_TWELVE_WEEKS_AGO: { EX: 1800 },
  CRON_ACTIVE_USER_KOREA_TWELVE_WEEKS_AGO: { EX: 1800 },
  CRON_ACTIVE_USER_JAPAN_TWELVE_WEEKS_AGO: { EX: 1800 },
  CRON_ACTIVE_USER_US_TWELVE_WEEKS_AGO: { EX: 1800 },
  CRON_ACTIVE_USER_ALL_AGE_RANGE: { EX: 1800 },
  CRON_ACTIVE_USER_KOREA_AGE_RANGE: { EX: 1800 },
  CRON_ACTIVE_USER_JAPAN_AGE_RANGE: { EX: 1800 },
  CRON_ACTIVE_USER_US_AGE_RANGE: { EX: 1800 },
  CRON_ACTIVE_USER_ALL_GENDER_COUNT: { EX: 1800 },
  CRON_KR_CS_ORDER_PAGE_COUNT: { EX: 1800 },
  CRON_KR_CS_CONSULT_PAGE_COUNT: { EX: 1800 },
})
