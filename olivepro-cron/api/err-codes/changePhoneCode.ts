export interface ErrorObject {
  code: number
  msg: string
  success: boolean
  data?: object
  list?: Array<object>
}

export const success: ErrorObject = {
  code: 200,
  msg: 'VerifyCode has been issued.',
  success: true,
}

export const phoneLengthErr: ErrorObject = {
  code: -2010,
  msg: 'An invalid phone number was entered.',
  success: false,
}

export const phoneLimitErr: ErrorObject = {
  code: -2011,
  msg: 'Too many requests have come from that number. Please allow time and try again.',
  success: false,
}
export const noExistPhoneErr: ErrorObject = {
  code: -2012,
  msg: 'There is no user with this number',
  success: false,
}
export const noRequestIdErr: ErrorObject = {
  code: -2014,
  msg: 'No request found',
  success: false,
}
export const notMatchedIdErr: ErrorObject = {
  code: -2015,
  msg: 'The code provided does not match the expected value',
  success: false,
}
export const wrongCodeLimitErr: ErrorObject = {
  code: -2016,
  msg: 'The wrong code was provided too many times',
  success: false,
}
export const waitNextErr: ErrorObject = {
  code: -2017,
  msg: 'Concurrent verifications to the same number are not allowed',
  success: false,
}
export const reqBodyErr: ErrorObject = {
  code: -2030,
  msg: 'request body error in issueChangePhoneCode',
  success: false,
}
export const existUserErr: ErrorObject = {
  code: -2110,
  msg: 'This phone number already exists.',
  success: false,
}
export const phoneApiErr: ErrorObject = {
  code: -2111,
  msg: 'Vonage Verify API Error',
  success: false,
}
