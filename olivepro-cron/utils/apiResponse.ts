export interface ErrorObject {
  code: number
  msg: string
  success: boolean
}

class ApiResponse {
  code: number
  msg: string
  success: boolean
  data?: object

  /**
   * ApiResponse 파라메터 값 리턴 생성
   * @param status
   * @param data
   */
  constructor(status: ErrorObject, data: object) {
    this.code = status.code
    this.msg = status.msg
    this.success = status.success
    this.data = data
  }
}

/**
 * 응답 공통 함수 data ( 객체 ) 를 넣지 않을경우 자동으로 undefined할당
 * @param status
 * @param data
 */
export const apiResponse = (status: ErrorObject, data: object = undefined) => {
  return new ApiResponse(status, data)
}
