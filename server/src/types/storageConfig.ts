import { StorageProvider } from '../constants/enums';

<<<<<<< HEAD
export interface StorageCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;
  cloudFrontDistributionId?: string;
=======
/**
 * Represents the configuration options for storing uploaded media. The
 * configuration determines which storage backend to use (e.g. S3, local
 * filesystem) and contains the credentials and other parameters needed to
 * interact with that backend. When the provider is `local` no credentials
 * are required. For cloud providers such as AWS S3, the credentials
 * property must be populated by an administrator at runtime.
 */
export interface StorageCredentials {
  /** The access key ID used for authenticating with the cloud provider. */
  accessKeyId?: string;
  /** The secret access key used for authenticating with the cloud provider. */
  secretAccessKey?: string;
  /** The region where the bucket lives. */
  region?: string;
  /** The name of the bucket to read/write objects. */
  bucketName?: string;
  /** Optional CloudFront distribution ID for generating signed URLs. */
  cloudFrontDistributionId?: string;
  /** Optional CloudFront domain name when known up front. */
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  cloudFrontDomainName?: string;
}

export interface StorageConfig {
<<<<<<< HEAD
  provider: StorageProvider;
  credentials?: StorageCredentials;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
=======
  /** The storage provider in use (e.g. s3, local). */
  provider: StorageProvider;
  /** Credentials and other provider-specific options. */
  credentials?: StorageCredentials;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
}