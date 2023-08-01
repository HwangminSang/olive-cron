const express = require('express')
const {
  send_notification_to_one_test,
  push_count_check
} = require('../controllers/notifications')

// const { authChecker } = require('../../utils/authChecker')

const router = express.Router()
// router.use('/', authChecker)
//현재 사용중
router.post('/count-check', push_count_check)
router.post('/to-one-test', send_notification_to_one_test)


// //현재 사용하지 않는다
// router.post('/to-all', send_notification_to_all)
// router.post('/to-gender', send_notification_to_gender)
// router.post('/to-age', send_notification_to_age)
// router.post('/to-os', send_notification_to_os)
// router.post('/to-app', send_notification_to_app)
// router.post('/to-topic', send_notification_to_topic)


module.exports = router
