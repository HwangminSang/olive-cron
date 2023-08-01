'use strict'

// const sequelize = require('sequelize');
// const { cmsPush } = require('../models');
// const handler = require('../../libs/util/mysql/handler')(cmsPush);

const sesEmail = require('../controllers/sesEmail.js')

var router = require('express').Router()

// Create a new SES Template based on the request data
router.post('/template', sesEmail.create)

// Retrieve all SesEmail
// router.get("/", sesEmail.findAll);

router.get('/', (req, res) => {
  res.send('AWS SES - Email Webservice')
})

// Get an SES Template based on the request data
router.get('/template/:id', sesEmail.findOne)

// Update an SES Template based on the request data
router.put('/template', sesEmail.update)

// Delete an SES Template based on the request data
router.delete('/template', sesEmail.delete)

// Send Email via AWS SES using the request Template and data
router.post('/send/template', sesEmail.sendEmailTemplate)

router.post('/send', sesEmail.sendEmail)

module.exports = router
