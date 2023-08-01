interface ErrorObject {
  code: number
  msg: string
  success: boolean
  data?: object
  list?: Array<object>
}

export const success: ErrorObject = {
  code: 200,
  msg: 'Redis key has been created',
  success: true,
}

export const redisKyeNotFount: ErrorObject = {
  code: -3101,
  msg: 'Redis-key not founded',
  success: false,
}

export const redisKeyDeleteErr: ErrorObject = {
  code: -3102,
  msg: 'Delete failed',
  success: false,
}

export const redisError: ErrorObject = {
  code: -1017,
  msg: 'Redis Error!',
  success: false,
}
