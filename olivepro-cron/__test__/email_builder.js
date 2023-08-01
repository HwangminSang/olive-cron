const SibApiV3Sdk = require('sib-api-v3-sdk');
const { log } =require('../winston/logger')
let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

sendSmtpEmail = {
  to: [{
    email: 'cynthia@oliveunion.com',
    name: 'Cynthia Kim'
  }],
  templateId: 1,
  params: {
    "name": "Cynthia",
    "email_code": 123456,
    "email_expire_at": "test"
  },
  headers: {
    'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
  }
};

apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  log.info('API called successfully. Returned data: ' + data);
}, function (error) {
  log.err(error);
});