import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
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
 * Creates a new S3 service instance. If `customConfig` is provided, the
 * service uses those credentials and parameters instead of falling back
 * to environment variables. This function allows the application to
 * dynamically switch between different AWS accounts or buckets at runtime.
 */
export const s3Service = (customConfig?: StorageCredentials) => {
  // Derive credentials and bucket/region from the custom configuration or
  // environment variables. Only assign fields if provided to avoid
  // overwriting required values with undefined.
  const accessKeyId = customConfig?.accessKeyId ?? configKeys.AWS_ACCESS_KEY;
  const secretAccessKey = customConfig?.secretAccessKey ?? configKeys.AWS_SECRET_KEY;
  const region = customConfig?.region ?? configKeys.AWS_BUCKET_REGION;
  const bucketName = customConfig?.bucketName ?? configKeys.AWS_BUCKET_NAME;
  const cloudFrontDistributionId =
    customConfig?.cloudFrontDistributionId ?? configKeys.CLOUDFRONT_DISTRIBUTION_ID;
  const cloudFrontDomainName =
    customConfig?.cloudFrontDomainName ?? configKeys.CLOUDFRONT_DOMAIN_NAME;

  // Instantiate new clients on each call. These clients are lightweight and
  // stateless; re-instantiating them with new credentials ensures that
  // subsequent calls use up-to-date configuration.
  const s3 = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    region
  });
  const cloudFront = new CloudFrontClient({
    credentials: { accessKeyId, secretAccessKey },
    region
  });

  const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

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
      ACL: 'public-read'
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return {
      name: file.originalname,
      key,
      url
    };
  };

  const getFile = async (fileKey: string) => {
    const getObjectParams = {
      Bucket: bucketName,
      Key: fileKey
    };
    const command = new GetObjectCommand(getObjectParams);
    return await getSignedUrl(s3, command, { expiresIn: 60000 });
  };

  const getVideoStream = async (key: string): Promise<NodeJS.ReadableStream> => {
    const s3Params = {
      Bucket: bucketName,
      Key: key
    };
    const command = new GetObjectCommand(s3Params);
    const { Body } = await s3.send(command);
    return Body as NodeJS.ReadableStream;
  };

  const getCloudFrontUrl = async (fileKey: string) => {
    // If a custom domain name is provided use it directly; otherwise fetch
    // the distribution details from AWS. This avoids the overhead of
    // retrieving the distribution on every request when the domain is known.
    if (cloudFrontDomainName) {
      return `https://${cloudFrontDomainName}/${fileKey}`;
    }
    const getDistributionParams = {
      Id: cloudFrontDistributionId
    };
    const command = new GetDistributionCommand(getDistributionParams);
    const { Distribution } = await cloudFront.send(command);
    const domain = Distribution?.DomainName;
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

  return {
    uploadFile,
    uploadAndGetUrl,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type CloudServiceImpl = typeof s3Service;
