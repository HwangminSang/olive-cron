import { Request, Response } from 'express';

import { BetaAnalyticsDataClient } from '@google-analytics/data';

import { GaRedisKey } from '../../redis/redisKey';
import { executeRedisCacheCheck, executeRedisGet, executeRedisSet } from '../../redis/redisUtil';
import {
    activeUserPerDayQuery, countryTotalQuery, genderCount, makeQueryNweekObject,
    makeQueryOneYearObject, makeQueryUserAgeRangeObject, totalUsersQuery
} from '../../utils/gaQueryObjects';
import {
    isExistsCountry, setRedisKeyAndGaQueryObjectCountry, sumUsersByCountry, sumUsersByCountryAll
} from '../../utils/gaUtils';
import { redisCli } from '../../utils/redis';
import { log } from '../../winston/logger';

const moment = require('moment') // const GA = {

// 쿼리를 만들어야 할 때 참고하세요.
// https://ga-dev-tools.web.app/query-explorer/

const GA = {
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCpqJXc2QVijzns\na3xZWO3ZxxsdlQtINuMQWYLhJLoOgpGq4PuPKe2H5rOndA14oj1pDgifgorTbo1J\nqWgT+aMnXajwEKjuIkHu89RRx3bg2am0/XrL1HcKTZHa9D4z7ejsBg8tcrA8+7ks\nsCF2D48F4QQOI+OAASgdUASwEFMOrOQhq74WCa5p7KMj4sJpicGa4q/4ZKuYcbYl\nxuD4sCDg3KzLXwYdrp8jlyu7tU0U1GG4OQvXEvau+Ab8XLakmXkSVOITgqeF7InU\n9GGlmDwo3mGIxBTjDvYrSUSqgsAckVeHDYG9pP9+VkMqfKdB887KHx0/sbwbDleX\nulkZrHrTAgMBAAECggEALBUaT2ZyUEAf0E7DYiHJt3bVFFQoOMzOJe7kI2TcFS4W\n9Fv98R53UgL/Nijg4THim/viALQ2JybH/lZOrTYFjxJ2dV4Wzr1G/XQMfG1D9buI\nrXbZY8HiZmJuXgJtcSfFiCIw6mGs6kOLw1FGeHslceUcHSJ1F8r1JdynQyoSsrKL\nwVIRiVURw7j7oH1FvjqaAXp3wK+Dzu7LDVt9RVerl7Mm1yvH7pg6ENnQRV5n6JJE\n1qaZFtQ5OW6+90/4aHGK1s+h/EigEertxsuljs9qLZY8QZ4ZFogFOgKz8RQt3uJx\nBtGwdTPji3mLK79qil8/BWy+LJRCboOVSWYNLSL8HQKBgQDmZ15I37EpFTlZDo/w\ndZoqWjZygqbVbvppW1n1fK1jWpN7/dyaSQeQIUllNZhFEvrI8OPcg48pVvA3E9nD\n2Z+Sa7ZhOI54SJyXS4hSq4LFoN6tCodVcA+WCOmaTMAZRddOA0aLZmm3Cvb8mL4U\nMef92+1MMrduq9dSIl+j2t5CxwKBgQC8gaLQOjFbVmsAow/fNmbhC0BRWNuiH7cW\nfK2wtoerJ8nVLO78JdTsfZqWguLTDyUBvLCdoQYD2I2qXlDgKPWoQYqBESfo7yMy\naUn0+hWRhD3i7yZE/axuYM8zXQeHbNFTWTTNHsSBlJpHykjZcDB6KzokzFOf48U2\nWRfzN/Z7lQKBgQCk5L+2mdkZlOX5FZHwPso5m1yyMU0jHQy8EDPem/8fRvicWX/j\nL3bpMNltRKEYdk/jNXtuGv1/UYgTcvJ71yj7yni5NZfI//aJ1PXYbITn2Yzj/NAE\nVnHhJ7m/w0QMEk7Xt0Jqi74G0SMYflwy6dClfxtiWD2tR/CPCKi4BPDiiwKBgEZy\nfBItbTyhMyPtzISypAf+WG8OMiaIi7fPqGmeDV2dZQRR4o5A5S3sUtVk3LfbtQzN\nI4QFJWZSi77buIXNSOE0fTp22t9mX1T7nDP9MgpLzYT9suOdmc82Rrj/T00BEcmA\nUQdHNFDo5C9oHYmFL9i4RuZxpd7fFFiXOygeBfNxAoGBAKpVbSuXd2O3n/Wm3Rez\nzlQ0pl4kbzJFaFv5DbGIBiVtgLxtjLpXZI/61hvqeTOgJYCMkJutEZbKUOPpLi2X\n+6TLHOhWyofNiuVgl7Hu8/0DO6khBrV2sBlxqqqAyZCjzlDj7+VGggmcSsU7gm7i\nfeexrt2TupN82xX6QOoshJXi\n-----END PRIVATE KEY-----\n',
  client_email: 'starting-account-mu2qiawadtn4@quickstart-1639100671156.iam.gserviceaccount.com',
}

const analyticsDataClient = new BetaAnalyticsDataClient({ credentials: GA })

export const countryTotal = async (req: Request, res: Response) => {
  const redisKey = GaRedisKey.COUNTRY_TOTAL

  try {
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const totals = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(totals))
      return
    }

    const [[countryTotal], [total]] = await Promise.all([analyticsDataClient.runReport(countryTotalQuery), analyticsDataClient.runReport(totalUsersQuery)])
    const totals = {
      countryTotal,
      total,
    }

    if (totals != undefined || totals != null) {
      executeRedisSet(redisCli, redisKey, totals)
      res.status(200).json({
        countryTotal,
        total,
      })
    } else res.status(404).json({ msg: 'gaResponse invalid' })
  } catch (error) {
    throw error
  }
}

export const activeUserPerDay = async (req: Request, res: Response) => {
  const redisKey = GaRedisKey.ACTIVE_USER_PER_DAY
  const isExists = await executeRedisCacheCheck(redisCli, redisKey)

  if (isExists) {
    const activeUserPerDay = await executeRedisGet(redisCli, redisKey)
    res.status(200).json(JSON.parse(activeUserPerDay))
    return
  }
  const _activeUserPerDay = await analyticsDataClient.runReport(activeUserPerDayQuery)
  if (_activeUserPerDay != undefined || _activeUserPerDay != null) {
    const resBody = {
      activeUserPerDay: _activeUserPerDay,
    }

    executeRedisSet(redisCli, redisKey, resBody)
    res.status(200).json(resBody)
  } else res.status(404).json({ msg: 'gaResponse invalid' })
}

// @ts-ignore
export const activeUserCountryAndOneYear = async (req: Request, res: Response) => {
  const { country } = req.query
  const today = new Date()
  const oneYearSupport = [
    { start: 0, end: 2 },
    { start: 3, end: 5 },
    { start: 6, end: 8 },
    { start: 10, end: 12 },
    { start: 13, end: 15 },
    { start: 16, end: 18 },
    { start: 19, end: 21 },
    { start: 22, end: 24 },
    { start: 25, end: 27 },
    { start: 28, end: 30 },
    { start: 31, end: 32 },
    { start: 33, end: 35 },
  ]

  let month = 1

  let monthList = []
  //전달 마지막날 구하기
  const endDate = moment(today.getTime()).startOf('month').format('YYYY-MM-DD')
  //1년전 날짜 구하기
  const startDate = moment(endDate).add('-1', 'y').format('YYYY-MM-DD')
  let startDate2 = moment(endDate).add('-1', 'y').format('YYYY-MM')
  let response = {
    1: '0',
    2: '0',
    3: '0',
    4: '0',
    5: '0',
    6: '0',
    7: '0',
    8: '0',
    9: '0',
    10: '0',
    11: '0',
    12: '0',
    totalCount: '0',
  }

  // @ts-ignore
  if (!isExistsCountry(country, res)) return

  for (let a = 1; a <= 12; a++) {
    monthList.push(startDate2)
    startDate2 = moment(startDate).add(`${a}`, 'months').format('YYYY-MM')
  }

  const { ACTIVE_USER_ALL_ONE_YEAR, ACTIVE_USER_KOREA_ONE_YEAR, ACTIVE_USER_JAPAN_ONE_YEAR, ACTIVE_USER_US_ONE_YEAR } = GaRedisKey

  const { redisKey, gaQueryObjectCountry } = setRedisKeyAndGaQueryObjectCountry(country, ACTIVE_USER_ALL_ONE_YEAR, ACTIVE_USER_KOREA_ONE_YEAR, ACTIVE_USER_JAPAN_ONE_YEAR, ACTIVE_USER_US_ONE_YEAR)

  const isExists = await executeRedisCacheCheck(redisCli, redisKey)

  if (isExists) {
    const activeUserCountryAndOneYear = await executeRedisGet(redisCli, redisKey)
    res.status(200).json(JSON.parse(activeUserCountryAndOneYear))
    return
  }

  const gaQueryObject = makeQueryOneYearObject(startDate, endDate, gaQueryObjectCountry)

  const gaResponse = await analyticsDataClient.runReport(gaQueryObject)

  if (gaResponse[0] != undefined || gaResponse[0] != null) {
    // @ts-ignore
    const rows = gaResponse[0]['rows']
    // @ts-ignore
    response.totalCount = gaResponse[0]['totals'][0]['metricValues'][0]['value']

    if (country === 'all') {
      oneYearSupport.forEach((v, i) => {
        // @ts-ignore
        response[month] = sumUsersByCountryAll(v, rows)
        month++
      })
    } else {
      response = sumUsersByCountry(response, rows)
    }

    const resBody = {
      activeUserCountryAndOneYear: response,
      monthList,
    }

    executeRedisSet(redisCli, redisKey, resBody)
    res.status(200).json(resBody)
  } else res.status(404).json({ msg: 'gaResponse invalid' })
}

export const activeUserCountryAndNweek = async (req: Request, res: Response) => {
  const { country } = req.query

  const { ACTIVE_USER_KOREA_TWELVE_WEEKS_AGO, ACTIVE_USER_JAPAN_TWELVE_WEEKS_AGO, ACTIVE_USER_US_TWELVE_WEEKS_AGO, ACTIVE_USER_ALL_TWELVE_WEEKS_AGO } = GaRedisKey

  const weekSupport = [
    { start: 0, end: 2 },
    { start: 3, end: 5 },
    { start: 6, end: 8 },
    { start: 10, end: 12 },
    { start: 13, end: 15 },
    { start: 16, end: 18 },
    { start: 19, end: 21 },
    { start: 22, end: 24 },
    { start: 25, end: 27 },
    { start: 28, end: 30 },
    { start: 31, end: 32 },
    { start: 33, end: 35 },
  ]
  let response = {
    1: '0',
    2: '0',
    3: '0',
    4: '0',
    5: '0',
    6: '0',
    7: '0',
    8: '0',
    9: '0',
    10: '0',
    11: '0',
    12: '0',
    totalCount: '0',
  }
  const weekList = []
  // @ts-ignore
  let weekNumber = []
  const countArray = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  let week = 1

  // 12주전 ( 일요일 ~ 토요일 까지의 통계)
  const startDate = moment().subtract(12, 'w').startOf('week').format('YYYY-MM-DD')
  const endDate = moment().startOf('week').format('YYYY-MM-DD')
  let startDate2 = moment().subtract(12, 'w').startOf('week')

  // @ts-ignore
  if (!isExistsCountry(country, res)) return

  const { redisKey, gaQueryObjectCountry } = setRedisKeyAndGaQueryObjectCountry(
    country,
    ACTIVE_USER_KOREA_TWELVE_WEEKS_AGO,
    ACTIVE_USER_JAPAN_TWELVE_WEEKS_AGO,
    ACTIVE_USER_US_TWELVE_WEEKS_AGO,
    ACTIVE_USER_ALL_TWELVE_WEEKS_AGO
  )

  try {
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const activeUserCountryAndNweek = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(activeUserCountryAndNweek))
      return
    }

    const gaQueryObject = makeQueryNweekObject(startDate, endDate, gaQueryObjectCountry)

    const gaResponse = await analyticsDataClient.runReport(gaQueryObject)

    if (gaResponse[0] != undefined || gaResponse[0] != null) {
      // @ts-ignore
      const rows = gaResponse[0]['rows']
      // @ts-ignore
      response.totalCount = gaResponse[0]['totals'][0]['metricValues'][0]['value']

      if (country === 'all') {
        log.info(`rows:  ${JSON.stringify(rows)}`)

        weekSupport.forEach(v => {
          // @ts-ignore
          response[week] = sumUsersByCountryAll(v, rows)
          week++
        })

        for (let a = 0; a <= 35; a++) {
          // @ts-ignore
          weekNumber.push(gaResponse[0]['rows'][a]['dimensionValues'][1]['value'])
        }
        //중복된 주 빼는 로직
        // @ts-ignore
        weekNumber = weekNumber.filter((element, index) => weekNumber.indexOf(element) === index)
      } else {
        response = sumUsersByCountry(response, rows)
        for (let a = 0; a <= 11; a++) {
          // @ts-ignore
          weekNumber.push(gaResponse[0]['rows'][a]['dimensionValues'][1]['value'])
        }
      }

      //weekList 날짜구하기
      for (let a = 0; a < countArray.length; a++) {
        let dateRange = `${startDate2.format('YYYY-MM-DD')}~${moment().subtract(countArray[a], 'w').startOf('week').subtract('1', 'days').format('YYYY-MM-DD')}`
        weekList.push(dateRange)
        startDate2 = moment().subtract(countArray[a], 'w').startOf('week')
      }

      const resBody = {
        activeUserCountryAndNweek: response,
        weekList,
        weekNumber,
      }

      executeRedisSet(redisCli, redisKey, resBody)
      res.status(200).json(resBody)
    } else res.status(404).json({ msg: 'gaResponse invalid' })
  } catch (error) {
    throw error
  }
}

export const activeUserAgeRange = async (req: Request, res: Response) => {
  const { country } = req.query
  const today = moment().tz('Asia/Seoul').format('YYYY-MM-DD')
  const response = {
    unknown: '0',
    '65+': '0',
    '55-64': '0',
    '45-54': '0',
    '35-44': '0',
    '25-34': '0',
    '18-24': '0',
    totalCount: '0',
  }
  const { ACTIVE_USER_ALL_AGE_RANGE, ACTIVE_USER_KOREA_AGE_RANGE, ACTIVE_USER_JAPAN_AGE_RANGE, ACTIVE_USER_US_AGE_RANGE } = GaRedisKey

  // @ts-ignore
  if (!isExistsCountry(country, res)) return

  const { redisKey, gaQueryObjectCountry } = setRedisKeyAndGaQueryObjectCountry(country, ACTIVE_USER_ALL_AGE_RANGE, ACTIVE_USER_KOREA_AGE_RANGE, ACTIVE_USER_JAPAN_AGE_RANGE, ACTIVE_USER_US_AGE_RANGE)

  try {
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const activeUserAgeRange = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(activeUserAgeRange))
      return
    }

    const gaQueryObject = makeQueryUserAgeRangeObject(today, gaQueryObjectCountry)

    const gaResponse = await analyticsDataClient.runReport(gaQueryObject)

    // @ts-ignore
    if (gaResponse[0] != undefined || gaResponse[0] != null) {
      response['totalCount'] = gaResponse[0]['totals'][0]['metricValues'][0]['value']

      // @ts-ignore
      const rows = gaResponse[0]['rows']

      if (country === 'all') {
        // @ts-ignore
        rows.forEach(el => (response[el['dimensionValues'][0]['value']] = el['metricValues'][0]['value']))
      } else {
        //@ts-ignore
        rows.forEach(el => (response[el['dimensionValues'][1]['value']] = el['metricValues'][0]['value']))
      }

      executeRedisSet(redisCli, redisKey, response)
      res.status(200).json(response)
    } else res.status(404).json({ msg: 'gaResponse invalid' })
  } catch (error) {
    throw error
  }
}

// 2021-06-01 ~ 어제
export const activeUserGenderCount = async (req: Request, res: Response) => {
  const response = {
    male: '0',
    female: '0',
  }

  const { ACTIVE_USER_ALL_GENDER_COUNT } = GaRedisKey

  try {
    const redisKey = ACTIVE_USER_ALL_GENDER_COUNT
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const activeUserGenderCount = await executeRedisGet(redisCli, redisKey)
      res.status(200).json(JSON.parse(activeUserGenderCount))
      return
    }

    const gaResponse = await analyticsDataClient.runReport(genderCount)

    log.info(`${JSON.stringify(gaResponse)}`)
    if (gaResponse[0] !== undefined || gaResponse[0] !== null) {
      // @ts-ignore
      response['male'] = gaResponse[0]['rows'][1]['metricValues'][0]['value']
      response['female'] = gaResponse[0]['rows'][2]['metricValues'][0]['value']

      executeRedisSet(redisCli, redisKey, response)
      res.status(200).json(response)
    } else res.status(404).json({ msg: 'gaResponse invalid' })
  } catch (error) {
    res.status(500).json({ msg: `error : ${error}` })
    throw error
  }
}
