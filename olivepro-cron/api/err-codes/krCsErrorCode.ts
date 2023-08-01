import { ErrorObject } from '../../utils/apiResponse'

export const success: ErrorObject = {
  code: 200,
  msg: '',
  success: true,
}

export const CSDBError: ErrorObject = {
  code: -1017,
  msg: 'Database Error!',
  success: false,
}

export const CSParameterError: ErrorObject = {
  code: -1020,
  msg: '',
  success: false,
}

export const noExistError: ErrorObject = {
  code: -3002,
  msg: 'This id is not exist in CS Data',
  success: false,
}
