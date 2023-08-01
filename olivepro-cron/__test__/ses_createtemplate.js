// Import required AWS SDK clients and commands for Node.js
import { CreateTemplateCommand }  from "@aws-sdk/client-ses";
import { sesClient } from "../libs/sesClient.js";
const { log } =require('../winston/logger')
// Create createTemplate params
const params = {
  Template: {
    TemplateName: "oliveTemplate", //TEMPLATE_NAME
    HtmlPart: "<h1>Hello {{name}},</h1><p>Your favorite fruit is {{favoriteFruit}}.</p>",
    SubjectPart: "Hello, {{name}}!",
    TextPart: "Dear {{name}},\r\nYour favorite animal is {{favoriteFruit}}.",
  },
};

const run = async () => {
  try {
    const data = await sesClient.send(new CreateTemplateCommand(params));
    log.info(
      "Success",
      data
    );
    return data; // For unit tests.
  } catch (err) {
    log.err("Error", err.stack);
  }
};
run();