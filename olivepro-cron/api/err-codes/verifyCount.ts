export interface ErrorObject {
  code: number
  msg: string
  success: boolean
  data?: object
  list?: Array<object>
}

export const phoneApiErr: ErrorObject = {
  code: -2013,
  msg: 'Vonage Verify API Error',
  success: false,
}
