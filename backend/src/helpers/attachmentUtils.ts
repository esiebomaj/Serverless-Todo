import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('Presigned url')

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const getSignedUploadUrl = async (todoId: string): Promise<string> => {
  logger.info('signing url', { todoId })
  return await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: 300
  })
}
