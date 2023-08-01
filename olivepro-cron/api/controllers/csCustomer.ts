'use strict'

import { Integer } from 'aws-sdk/clients/apigateway'
import { NextFunction, Request, Response } from 'express'
import fs from 'fs'

import { log } from '../../winston/logger'
import { CSDBError, CSParameterError, noExistError, success } from '../err-codes/krCsErrorCode'
import { apiResponse } from '../../utils/apiResponse'
import { insertConsult } from '../mysql/cs.consult.js'
import { bulkSoftDelete, customerPage, existCustomer, findAllCustomer, findOneCustomer, findOneCustomerWithOrderAndConsult, insertCustomer, updateCustomer } from '../mysql/cs.customer.js'
import { insertOrder } from '../mysql/cs.order.js'

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('createCustomer in createCustomer')

    const customer = req.body
    const { id } = await insertCustomer(customer)
    const data = { id }
    success.msg = 'Customer has been created'
    res.status(201).send(apiResponse(success, data))
  } catch (error) {
    log.err(`Error : ${error} =========> createCustomer in createCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    log.info('getCustomer in getCustomer')
    const result = await findOneCustomer(id)

    //해당 id가 존재하지 않을떄.  원래 204 or 404 중에 하나를 고르는게 적합해 보입니다. 204 보낼시 아래 msg는 전달되지 않습니다. 그래서 404로 보냅니다
    if (!result) {
      log.info(`ID : ${id} is not exist in csCustomer in getCustomer`)
      success.msg = `ID : ${id} is not exist in csCustomer`
      res.status(404).send(apiResponse(success))
      return
    }
    success.msg = 'Customer has been found'
    res.status(200).send(apiResponse(success, result[0]))
  } catch (error) {
    log.err(`Error : ${error} =========> getCustomer in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getCustomerWithOrderAndConsult = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    log.info('getCustomer in getCustomer')
    const result = await findOneCustomerWithOrderAndConsult(id)

    //해당 id가 존재하지 않을떄.  원래 204 or 404 중에 하나를 고르는게 적합해 보입니다. 204 보낼시 아래 msg는 전달되지 않습니다. 그래서 404로 보냅니다
    if (!result[0]) {
      log.info(`ID : ${id} is not exist in csCustomer in getCustomer`)
      noExistError.msg = `ID : ${id} is not exist in csCustomer`
      res.status(404).send(apiResponse(noExistError))
      return
    }
    success.msg = 'Customer has been found'
    res.status(200).send(apiResponse(success, result[0]))
  } catch (error) {
    log.err(`Error : ${error} =========> getCustomer in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const updateCSCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query
  const customer = req.body

  try {
    log.info('updateCustomer in csCustomer')
    const item = await findOneCustomer(id)
    if (!item) {
      success.msg = `ID : ${id} is not exist in csCustomer`
      log.info(`ID : ${id} is not exist in csCustomer in updateCustomer`)
      res.status(404).send(apiResponse(success))
      return
    }

    const [count] = await updateCustomer(id, customer)

    if (count === 0) {
      success.msg = `ID: ${id} has been failed in csCustomer`

      res.status(200).send(apiResponse(success))
      return
    }

    success.msg = `ID: ${id} has been Updated in csCustomer`

    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> updateCustomer in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  log.info('deleteCustomer in csCustomer')

  const idList: any = req.query.idList

  try {
    if (idList === '' || idList === undefined) {
      log.info(`idList : ${idList}  ===> Please check your Parameter`)
      CSParameterError.msg = `Please check your Parameter`
      res.status(400).send(apiResponse(CSParameterError))
      return
    }

    const idArray: string[] = idList.split(',')

    const [count] = await bulkSoftDelete(idArray)

    if (count === 0) {
      success.msg = `ID: ${idList} already has been deleted in csCustomer`

      res.status(200).send(apiResponse(success))
      return
    }
    success.msg = `ID: ${idList} has been Deleted in csCustomer`

    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> deleteCustomer in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getCustomerList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('getCustomerList in csCustomer')
    const result = await findAllCustomer()

    success.msg = 'csCustomer has been found'
    res.status(200).send(apiResponse(success, result))
  } catch (error) {
    log.err(`Error : ${error} =========> getCustomerList in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getCustomerPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('getCustomerPage in csCustomer')
    const { pageNum, limit, order, orderKeyWord } = req.query
    const { keyword, value } = req.body

    const result = await customerPage(pageNum, limit, order, orderKeyWord, keyword, value)
    const { count, rows: list } = result
    const responseData = { count, list }

    success.msg = 'Pagination success'

    res.status(200).send(apiResponse(success, responseData))
  } catch (error) {
    log.err(`Error : ${error} =========> getCustomerPage in csCustomer`)
    res.status(500).send(apiResponse(CSDBError))
  }
}
export const setCsvData = async filename => {
  try {
    log.info('setCsvData in createBulkCustomer')
    var csv = fs.readFileSync(filename, 'utf-8')

    csv = csv.replace('\r', '')
    var allRows = csv.split(/\n/)
    var rowData = []

    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
      var rowCells = allRows[singleRow].split('|')
      if (singleRow >= 1 && rowCells[0] !== '') {
        console.log(singleRow + ' ==> ' + rowCells[0] + ' \n')
        rowData.push(rowCells)
      }

      console.log(rowData)
    }

    for (var i = 0; i < rowData.length; i++) {
      console.log(i + ' ==> ' + rowData[i][0] + ' \n')

      if (rowData[i][0] === '') continue

      const customer = {
        name: rowData[i][0],
        subName: rowData[i][1],
        phoneNumber: rowData[i][2].toString().trimStart(),
        subPhoneNumber: rowData[i][3],
        email: rowData[i][4],
        customerInfo: '',
      }

      let customer_id: Integer
      const user = await existCustomer(rowData[i][0], rowData[i][2])
      if (user) {
        customer_id = user[0].id
      } else {
        const { id } = await insertCustomer(customer)
        customer_id = id
      }

      const consult = {
        customer_id,
        consultNumber: rowData[i][5],
        consultDate: rowData[i][6],
        categoryMain: rowData[i][7],
        categorySub: rowData[i][8],
        // reservedAt: 1634022060000, // CSV Column 없음.
        content: rowData[i][9],
        staff: rowData[i][10],
        csStatus: rowData[i][11] === '예약' ? 1 : rowData[i][11] === '완료' ? 2 : rowData[i][11],
      }

      if (consult.consultDate === '') delete consult.consultDate
      // if (consult.reservedAt === '') delete consult.reservedAt

      await insertConsult(consult)

      const order = {
        customer_id,
        product: rowData[i][12],
        productCount: rowData[i][13],
        productStatus: rowData[i][14] === 'A급' ? 'A' : rowData[i][14] === 'B급' ? 'B' : rowData[i][14] === 'C급' ? 'C' : 'D',
        orderAt: rowData[i][15],
        shopName: rowData[i][16],
        serialNumber: rowData[i][17],
        monthlyFee: rowData[i][18],
        subscriptionFee: rowData[i][19],
        address: rowData[i][20],
        delivery: rowData[i][21],
        deliveryCode: rowData[i][22],
        returnType: rowData[i][23],
        returnAt: rowData[i][24],
        returnReason: rowData[i][25],

        returnSerialNumber: rowData[i][26],
        returnReserve: rowData[i][27],
        returnUsed: rowData[i][28] === '사용' ? 1 : rowData[i][28] === '미사용' ? 0 : 0,
        deposit: rowData[i][29] === '완료' ? 1 : rowData[i][29] === '미완료' ? 0 : 0,
        asCost: rowData[i][30] ?? 0,

        returnZipCode: rowData[i][31],
        returnAddress: rowData[i][32],
        returnDelivery: rowData[i][33],
        returnDeliveryCode: rowData[i][34],
        companyCost: rowData[i][35] ?? 0, // nullish 병합 연산자(nullish coalescing operator) ??   -> a가 null도 아니고 undefined도 아니면 a
        userCost: rowData[i][36] ?? 0,
        otherAnswer: rowData[i][37],
      }

      if (order.orderAt === '') delete order.orderAt
      if (order.returnAt === '') delete order.returnAt

      await insertOrder(order)

      // console.log('\ncustomer : ' + JSON.stringify(customer))
      // console.log('\nconsult : ' + JSON.stringify(consult))
      // console.log('\norder : ' + JSON.stringify(order))
    }

    console.log('\nrowData.length : ' + rowData.length)
    return rowData.length > 0 ? true : false
  } catch (error) {
    log.err(`Error : ${error} =========> setCsvData in createBulkCustomer`)
  }
}
