'use strict'

import { Router } from 'express'


import {
    activeUserCountryAndOneYear,
    activeUserPerDay,
    countryTotal,
    activeUserCountryAndNweek,
    activeUserAgeRange,
    activeUserGenderCount
} from '../controllers/ga'
import { log } from '../../winston/logger'

const gaRouter = Router()

log.info('Google analytics Start')

gaRouter.get('/countryTotal', countryTotal)

gaRouter.get('/activeUserPerDay', activeUserPerDay)

gaRouter.get('/activeUserCountryAndOneYear',activeUserCountryAndOneYear)

gaRouter.get('/activeUserCountryAndNweek',activeUserCountryAndNweek)

gaRouter.get('/activeUserAgeRange',activeUserAgeRange)

gaRouter.get('/activeUserGenderCount',activeUserGenderCount)

export default gaRouter
