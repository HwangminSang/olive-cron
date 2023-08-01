// 'use strict'

// const cron = require('cron')

// // # ┌────────────── second (optional)
// // # │ ┌──────────── minute
// // # │ │ ┌────────── hour
// // # │ │ │ ┌──────── day of month
// // # │ │ │ │ ┌────── month
// // # │ │ │ │ │ ┌──── day of week
// // # │ │ │ │ │ │
// // # │ │ │ │ │ │
// // # * * * * * *
// const cronTime = ' * */12 * * *'

// const db = require('../models')

// const VideoChat = db.videoChat
// const { Op } = db.Sequelize

// // const cronTime = '*/15 * * * * *';

// console.log('Register VideoChat SessionList Cron:', `${process.env.NODE_ENV}_${new Date().toISOString()}_${process.pid}`)

// const sleep = function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// exports.everyFiveMinute = new cron.CronJob({
//   cronTime,
//   start: false,
//   onTick: () => {
//     proc()
//       .then(() => { })
//       .catch(err => {
//         console.log('Register VideoChat SessionList Cron ERROR:', err)
//       })
//   },
// })

// if (process.env.NODE_ENV === 'test') {
//   proc()
//     .then(() => { })
//     .catch(err => {
//       console.error(err)
//     })
// }
