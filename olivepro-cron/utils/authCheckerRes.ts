interface AuthChkRes {
  code: number
  success: boolean
  msg: string
  data?: object
  list?: object
}

export const dbFindErr: AuthChkRes = {
  code: -1505,
  success: false,
  msg: 'This employee is not exsist',
}

export const tokenTypeErr: AuthChkRes = {
  code: -1002,
  success: false,
  msg: 'You do not have permission to access this resource..',
}

export const accessDeniedErr: AuthChkRes = {
  code: -1003,
  success: false,
  msg: 'A resource that can not be accessed with the privileges it has',
}

export const jswDecodedTypeErr: AuthChkRes = {
  code: -2101,
  success: false,
  msg: 'Token Decoded does not exist or the type is not string.',
}

export const expiredErr: AuthChkRes = {
  code: -1021,
  success: false,
  msg: 'expired Token Error!',
}

export const secKetErr: AuthChkRes = {
  code: -2103,
  success: false,
  msg: 'Could not find jwt internal decode password in environment variable.',
}

export const decodeErr: AuthChkRes = {
  code: -2104,
  success: false,
  msg: 'User information could not be found in the result of decoding jwt token information.',
}

export const dbConnErr: AuthChkRes = {
  code: -2105,
  success: false,
  msg: 'There is a problem with the db connection.',
}
