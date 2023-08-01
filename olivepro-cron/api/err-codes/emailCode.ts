interface ErrorObject {
  code: number
  msg: string
  success: boolean
  data?: object
  list?: Array<object>
}

export const emailLimitErr: ErrorObject = {
  code: -2200,
  msg: 'Too many requests have come from that number. Please allow time and try again.',
  success: false,
}

export const noUserErr: ErrorObject = {
  code: -2201,
  msg: 'There is no user with this email.',
  success: false,
}

export const emailApiErr: ErrorObject = {
  code: -2202,
  msg: 'Sendinblue Api Error',
  success: false,
}
