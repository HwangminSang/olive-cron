export interface ErrorObject {
  code: number
  msg: string
  success: boolean
  data?: object
  list?: Array<object>
}

export const success: ErrorObject = {
  code: 0,
  msg: 'CmsPush has been created',
  success: true,
}

export const cmsPushKeyTopicErr: ErrorObject = {
  code: -1019,
  msg: '',
  success: false,
}

export const notExistUser: ErrorObject = {
  code: -5000,
  msg: 'Not found user',
  success: false,
}
