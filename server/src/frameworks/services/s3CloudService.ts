import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CloudFrontClient,
  GetDistributionCommand
} from '@aws-sdk/client-cloudfront';
import configKeys from '../../config';
import crypto from 'crypto';
import { StorageCredentials } from '../../types/storageConfig';

/**
 * Creates a new S3 service instance.
 * Allows using dynamic credentials or falling back to env-based config.
 */
export const s3Service = (customConfig?: StorageCredentials) => {
  const accessKeyId = customConfig?.accessKeyId ?? configKeys.AWS_ACCESS_KEY;
  const secretAccessKey = customConfig?.secretAccessKey ?? configKeys.AWS_SECRET_KEY;
  const region = customConfig?.region ?? configKeys.AWS_BUCKET_REGION;
  const bucketName = customConfig?.bucketName ?? configKeys.AWS_BUCKET_NAME;
  const cloudFrontDistributionId =
    customConfig?.cloudFrontDistributionId ?? configKeys.CLOUDFRONT_DISTRIBUTION_ID;
  const cloudFrontDomainName =
    customConfig?.cloudFrontDomainName ?? configKeys.CLOUDFRONT_DOMAIN_NAME;

  const s3 = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    region
  });

  const cloudFront = new CloudFrontClient({
    credentials: { accessKeyId, secretAccessKey },
    region
  });

  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');

  const uploadFile = async (file: Express.Multer.File) => {
    const key = randomImageName();
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    
/**
 * Upload a file to an explicit S3 object key (no randomization).
 * The key should include any folders (e.g., "courses/<courseId>/<kind>/.../name.ext").
 */
const uploadAtKey = async (file: Express.Multer.File, key: string) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer ?? file, // for memoryStorage; fallback if needed
    ContentType: (file as any).mimetype || 'application/octet-stream',
    ACL: 'public-read' as ObjectCannedACL
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
  return { name: file.originalname, key, url };
};

  return {
      name: file.originalname,
      key
    };
  };

  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const key = randomImageName();
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as ObjectCannedACL // ✅ Fixed ACL type issue
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    
/**
 * Upload a file to an explicit S3 object key (no randomization).
 * The key should include any folders (e.g., "courses/<courseId>/<kind>/.../name.ext").
 */
const uploadAtKey = async (file: Express.Multer.File, key: string) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer ?? file, // for memoryStorage; fallback if needed
    ContentType: (file as any).mimetype || 'application/octet-stream',
    ACL: 'public-read' as ObjectCannedACL
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
  return { name: file.originalname, key, url };
};

  return {
      name: file.originalname,
      key,
      url
    };
  };

  const getFile = async (fileKey: string) => {
    const params = {
      Bucket: bucketName,
      Key: fileKey
    };
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3, command, { expiresIn: 60000 });
  };

  const getVideoStream = async (key: string): Promise<NodeJS.ReadableStream> => {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command);
    return Body as NodeJS.ReadableStream;
  };

  const getCloudFrontUrl = async (fileKey: string) => {
    if (cloudFrontDomainName) {
      return `https://${cloudFrontDomainName}/${fileKey}`;
    }

    const command = new GetDistributionCommand({
      Id: cloudFrontDistributionId
    });

    const { Distribution } = await cloudFront.send(command);
    const domain = Distribution?.DomainName;
    if (!domain) throw new Error('CloudFront domain not found');

    return `https://${domain}/${fileKey}`;
  };

  const removeFile = async (fileKey: string) => {
    const params = {
      Bucket: bucketName,
      Key: fileKey
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  };

  
/**
 * Upload a file to an explicit S3 object key (no randomization).
 * The key should include any folders (e.g., "courses/<courseId>/<kind>/.../name.ext").
 */
const uploadAtKey = async (file: Express.Multer.File, key: string) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer ?? file, // for memoryStorage; fallback if needed
    ContentType: (file as any).mimetype || 'application/octet-stream',
    ACL: 'public-read' as ObjectCannedACL
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
  return { name: file.originalname, key, url };
};

  return {
    uploadFile,
    uploadAndGetUrl,
    uploadAtKey,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type CloudServiceImpl = typeof s3Service;
