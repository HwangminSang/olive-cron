// Import required AWS SDK clients and commands for Node.js
import {
    VerifyEmailIdentityCommand
}  from "@aws-sdk/client-ses";
import { sesClient } from "../libs/sesClient.js";
const { log } = require('../winston/logger')
// Set the parameters
const params = { EmailAddress: "dev@oliveunion.com" }; //ADDRESS@DOMAIN.EXT; e.g., name@example.com


const run = async () => {
  try {
    const data = await sesClient.send(new VerifyEmailIdentityCommand(params));
    log.info("Success.", data);
    return data; // For unit tests.
  } catch (err) {
    log.err("Error", err.stack);
  }
};
run();