import * as dotenv from 'dotenv';

dotenv.config()
/**
 * Config file
 */
const config: { port: number; aws_access_key_id: string; aws_secret_access_key: string; bucket_name: string; aws_region: string } = {
  port: Number(process.env.PORT) ?? 3000,
  /* ENV : process.env.NODE_ENV || 'dev',// The default env is dev. */
  aws_access_key_id: `AKIA3JORDYF5CKC5LCEZ`, // process.env.AWS_ACCESS_KEY_ID ?? '',
  aws_secret_access_key: `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`, // process.env.AWS_SECRET_ACCESS_KEY ?? '',
  aws_region: `ap-northeast-2`, // process.env.AWS_REGION ?? '',
  bucket_name: `image.oliveapi.com`, // process.env.BUCKET_NAME ?? 'test-bucket'
}

export default config

/**
 * AWS S3
 */
// s3AccessKey: `AKIA3JORDYF5CKC5LCEZ` // process.env.S3_ACCESS_KEY as string,
// s3SecretKey: `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` // process.env.S3_SECRET_KEY as string,
// bucketName: `image.oliveapi.com` // process.env.BUCKET_NAME as string
