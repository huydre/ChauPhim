import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import config from '../../config';
import logger from '../../config/logger';

async function setupStorage() {
  const s3Client = new S3Client({
    endpoint: config.STORAGE_ENDPOINT,
    region: config.STORAGE_REGION,
    credentials: {
      accessKeyId: config.STORAGE_ACCESS_KEY,
      secretAccessKey: config.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
  });

  try {
    // Check if bucket exists
    logger.info(`Checking if bucket '${config.STORAGE_BUCKET}' exists...`);
    
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: config.STORAGE_BUCKET }));
      logger.info(`Bucket '${config.STORAGE_BUCKET}' already exists`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Bucket doesn't exist, create it
        logger.info(`Creating bucket '${config.STORAGE_BUCKET}'...`);
        
        await s3Client.send(new CreateBucketCommand({ 
          Bucket: config.STORAGE_BUCKET 
        }));
        
        logger.info(`Bucket '${config.STORAGE_BUCKET}' created successfully`);
      } else {
        throw error;
      }
    }
    
    logger.info('Storage setup completed successfully');
  } catch (error: any) {
    logger.error('Storage setup failed:', error);
    throw error;
  }
}

export default setupStorage;
