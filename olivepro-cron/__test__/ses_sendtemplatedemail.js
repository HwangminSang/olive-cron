// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';
const { log } = require('../winston/logger')
// Set the region 
AWS.config.update({region: 'ap-northeast-2'});

// Create sendTemplatedEmail params 
const params = {
  Destination: { /* required */
    ToAddresses: [
      'cynthia@oliveunion.com',
      /* more To email addresses */
    ]
  },
  Source: 'cynthia@oliveunion.com', /* required */
  Template: 'SEMPLATES_DEMO', /* required */
  TemplateData: '{ \"name\":\"Cynthia\", \"favoriteFruit\": \"strawberry\" }', /* required */
  ReplyToAddresses: [
    'dev@oliveunion.com'
  ],
};


// Create the promise and SES service object
var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    log.info(data);
  }).catch(
    function(err) {
    log.err(err, err.stack);
  });