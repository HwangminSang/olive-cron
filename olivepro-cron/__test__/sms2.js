const Vonage = require('@vonage/server-sdk')
const { log } = require('../winston/logger')
const vonage = new Vonage({
  apiKey: "b821532a",
  apiSecret: "f2lUMTzEKhNBglO2"
})

const from = "Vonage APIs";
const to = "821056556578";
const text = 'A text message sent using the Vonage SMS API';

vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        log.err(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            log.info("Message sent successfully.");
        } else {
            log.info(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
})