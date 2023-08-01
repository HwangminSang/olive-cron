const fs = require('fs')
const { ses, SENDER_EMAIL } = require('../../libs/aws')

const sequelize = require('sequelize')
const { emailHistory } = require('../models')
const handler = require('../../libs/util/mysql/handler')(emailHistory)
const { parse, stringify, toJSON, fromJSON } = require('flatted')
const { log } = require('../../winston/logger')
const Op = sequelize.Op

/**
 * Create a new SES Template based on the request data
 */
exports.create = async (req, res) => {
  const { templateName, subject, body } = req.body

  const templateHtmlFileData = fs.readFileSync('./templates/confirm_email/welcome.html', 'utf8')
  log.info(`${templateHtmlFileData} in create`)

  const params = {
    // TODO: Test
    // Template: {
    //   TemplateName: "MyTemplate",
    //   SubjectPart: "Greetings, {{name}}!",
    //   HtmlPart: "<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>",
    //   TextPart: "Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}."
    // }

    Template: {
      TemplateName: templateName,
      HtmlPart:
        '<!-- FILE: ./templates/welcome.mjml --> <!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title>OliveUnion</title><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding: 0; } body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; } p { display: block; margin: 13px 0; }</style><!--[if mso]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--><!--[if lte mso 11]> <style type="text/css"> .mj-outlook-group-fix { width:100% !important; } </style> <![endif]--><style type="text/css">@media only screen and (min-width:480px) { .mj-column-per-100 { width: 100% !important; max-width: 100%; } }</style><style type="text/css">@media only screen and (max-width:481px) { table.mj-full-width-mobile { width: 100% !important; } td.mj-full-width-mobile { width: auto !important; } }</style></head><body style="word-spacing:normal;"><div><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:100px;"><img height="auto" src="https://www.oliveunion.shop/data/skin/front/r_jh06/img/banner/1bb87d41d15fe27b500a4bfcde01bb0e_16369.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="100"></td></tr></tbody></table></td></tr><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><p style="border-top:solid 4px #fcba03;font-size:1px;margin:0px auto;width:100%;"></p><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #fcba03;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp; </td></tr></table><![endif]--></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:20px;line-height:1;text-align:left;color:#fcba03;">Hello {{name}}!</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;line-height:1;text-align:left;color:#000000;">Welcome to OliveUnion!</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;line-height:1;text-align:left;color:#000000;">Before starting, we need to validate your email. Click in this link to proceed:</div></td></tr><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tr><td align="center" bgcolor="#fcba03" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#fcba03;" valign="middle"><a href="{{link}}" style="display:inline-block;background:#fcba03;color:#ffffff;font-family:helvetica;font-size:20px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank">Validate email</a></td></tr></table></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:20px;line-height:1;text-align:left;color:#fcba03;">OliveUnion Team.</div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>',
      // body,
      SubjectPart: 'Welcome to OliveUnion!', // subject,
      TextPart:
        'Hello {{name}}!\r\nWelcome to Olive union!\r\nBefore starting, we need to validate your email. Click in this link to proceed:\r\n\r\nValidate email {{link}}\r\n\rOlive union Team.\r\n',
    },
  }

  ses.createTemplate(params, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(200)
    }
  })
}

/**
 * Get an SES Template based on the request data
 */
exports.findOne = (req, res) => {
  const templateName = req.params.id

  const params = {
    TemplateName: templateName /* required */,
  }
  ses.getTemplate(params, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
}

/**
 * Update an SES Template based on the request data
 */
exports.update = (req, res) => {
  const { templateName, subject, body } = req.body

  const params = {
    Template: {
      TemplateName: templateName,
      HtmlPart: body,
      SubjectPart: subject,
    },
  }

  ses.updateTemplate(params, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(200)
    }
  })
}

/**
 * Delete an SES Template based on the request data
 */
exports.delete = (req, res) => {
  const { templateName } = req.body

  const params = {
    TemplateName: templateName,
  }

  ses.deleteTemplate(params, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(200)
    }
  })
}

/**
 * Send Email via AWS SES using the request Template and data
 */
exports.sendEmailTemplate = (req, res) => {
  const { from, to, templateName, templateData } = req.body
  log.info(`${templateData} in sendEmailTemplate`)

  let tmpJsonFile = fs.readFileSync('./templates/email_test_param_01.json', 'utf8')
  tmpJsonFile = JSON.parse(tmpJsonFile)

  log.info(`${tmpJsonFile} in sendEmailTemplate`)
  let params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    ConfigurationSetName: 'ConfigSet',
    Template: templateName,
    // TemplateData: "{ \"name\":\"Alejandro\", \"favoriteanimal\": \"alligator\" }",
    // TemplateData: "{ \"name\":\"kelvin\", \"link\": \"oliveunion.com\" }",
    // TemplateData: tmpJsonFile,
    TemplateData: JSON.stringify(tmpJsonFile),
  }

  ses.sendTemplatedEmail(params, function (err, data) {
    if (err) {
      log.err(`'err' : ${JSON.stringify(err)}`)
      handler.put({
        type: 1,
        sender: from,
        send_to: to,
        used_template: templateName,
        template_data: templateData,
        success: 2,
        response_data: stringify(res),
        error_data: JSON.stringify(err),
      })
      res.send(err)
    } else {
      handler.put({
        type: 1,
        sender: from,
        send_to: to,
        used_template: templateName,
        template_data: templateData,
        success: 1,
        response_data: stringify(res),
      })
      res.send(200)
    }
  })
}

exports.sendEmail = (req, res) => {
  const { from, to, subject, body } = req.body
  try {
    let params = {
      Source: from,
      Destination: {
        ToAddresses: [to],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
    }
    ses
      .sendEmail(params)
      .promise()
      .then(response => {
        handler.put({
          type: 1,
          sub_title: subject,
          body: body,
          sender: from,
          send_to: to,
          // used_template: templateName,
          // template_data: templateData,
          success: 1,
          response_data: stringify(res),
        })
        return res.status(200).json({ message: 'email send success' })
      })
      .catch(error => {
        handler.put({
          type: 1,
          sub_title: subject,
          body: body,
          sender: from,
          send_to: to,
          // used_template: templateName,
          // template_data: templateData,
          success: 2,
          response_data: stringify(res),
          error_data: JSON.stringify(error),
        })
        return res.status(error.statusCode ? error.statusCode : 400).json(error)
      })
  } catch (error) {
    handler.put({
      type: 1,
      sub_title: subject,
      body: body,
      sender: from,
      send_to: to,
      // used_template: templateName,
      // template_data: templateData,
      success: 2,
      response_data: stringify(res),
      error_data: JSON.stringify(error),
    })
    return res.status(500).json({ message: 'email send Error' })
  }
}
