'use strict'

const AWS = require('aws-sdk')

const config = require('../config')

AWS.config.update({
  accessKeyId: config.AWSAccessKeyId,
  secretAccessKey: config.AWSSecretAccessKey,
  region: config.AWSRegion,
})

exports.sns = new AWS.SNS()
