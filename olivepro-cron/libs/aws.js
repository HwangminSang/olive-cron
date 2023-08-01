'use strict'

const AWS = require('aws-sdk')

const config = require('../config')

AWS.config.update({
  accessKeyId: 'AKIA3JORDYF5CKC5LCEZ', // config.AWSAccessKeyId,
  secretAccessKey: `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`, // config.AWSSecretAccessKey,
  region: 'ap-northeast-2', // config.AWSRegion,
})

exports.sns = new AWS.SNS({ region: 'us-east-1' })
exports.docClient = new AWS.DynamoDB.DocumentClient()
exports.s3 = new AWS.S3()
exports.cloudfront = new AWS.CloudFront()
exports.elasticbeanstalk = new AWS.ElasticBeanstalk()
exports.autoscaling = new AWS.AutoScaling()
exports.ses = new AWS.SES({ region: 'ap-northeast-2' })
exports.sms = new AWS.SMS({ region: 'ap-northeast-2' })

exports.SENDER_EMAIL = 'kelvin@oliveunion.com'
