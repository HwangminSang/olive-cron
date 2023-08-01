const fs = require('fs')
const path = require('path')

const getCsvData = filename => {
  const csvPath = path.join(__dirname, '.', 'CS_KR_20221215_xls_to_csv.csv')
  const csv = fs.readFileSync(csvPath, 'utf-8')

  var allRows = csv.split(/\n|\r/)
  rowData = []

  for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
    var rowCells = allRows[singleRow].split('|')
    if (singleRow >= 1) {
      if (rowCells[0] !== '') {
        console.log(singleRow + ' ==> ' + rowCells[20] + rowCells[21] + ' \n')
        rowData.push(rowCells)
      }
    }

    console.log(rowData)
  }

  for (var i = 0; i < rowData.length; i++) {
    console.log(i + ' ==> ' + rowData[i][0] + ' \n')

    if (rowData[i][0] === '') continue

    const customer = {
      name: rowData[i][0],
      subName: rowData[i][1],
      phoneNumber: rowData[i][2],
      subPhoneNumber: rowData[i][3],
      email: rowData[i][4],
      customerInfo: '',
    }

    const customer_id = i + 1

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

    const order = {
      customer_id,
      product: rowData[i][12],
      productCount: rowData[i][13],
      productStatus: rowData[i][14] === 'A급' ? 'A' : rowData[i][14] === 'B급' ? 'B' : rowData[i][14] === 'C급' ? 'C' : 'D',
      orderAt: rowData[i][15],
      shopName: rowData[i][16],
      serialNumber: rowData[i][17],
      orderNumber: rowData[i][18],
      zipCode: rowData[i][19],
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
      asCost: rowData[i][30],

      returnZipCode: rowData[i][31],
      returnAddress: rowData[i][32],
      returnDelivery: rowData[i][33],
      returnDeliveryCode: rowData[i][34],
      companyCost: rowData[i][35],
      userCost: rowData[i][36],
      otherAnswer: rowData[i][37],
    }

    console.log('\n\ncustomer : ' + JSON.stringify(customer))

    console.log('\n\nconsult : ' + JSON.stringify(consult))

    console.log('\n\norder : ' + JSON.stringify(order))
  }
}
getCsvData('csv')
