import { S3 } from 'aws-sdk';
import fs from 'fs';

import config from '../config';
import { setCsvData } from '../controllers/csCustomer';

/**
 * @name uploadToS3
 * @type {Function}
 * @param {S3} s3
 * @param {File} fileData
 * @description it's upload the current to the bucket
 * @returns {Promise<{success:boolean; message: string; data: object;}>}
 * @author messaismael
 */
export const uploadToS3 = async (s3: S3, fileData?: Express.Multer.File): Promise<{ success: boolean; message: string; data: object }> => {
  try {
    const fileContent = fs.readFileSync(fileData!.path)
    console.log(fileData!.path)

    const params = {
      Bucket: config.bucket_name + '/uploads',
      Key: fileData!.originalname,
      Body: fileContent,
    }

    try {
      const res = await s3.upload(params).promise()
      console.log('File Uploaded with Successfull', decodeURI(res.Location))

      // 고객, 상담, 주문 내역을 DB에 추가 한다.
      const data = await setCsvData(fileData!.path)
      console.log('Customer, Consult, Order Infomation insert with Successfull ==> ', data)

      return { success: true, message: 'File Uploaded with Successfull', data: res }
    } catch (error) {
      return { success: false, message: 'Unable to Upload the file', data: error }
    }
  } catch (error) {
    return { success: false, message: 'Unalbe to access this file', data: {} }
  }
}
