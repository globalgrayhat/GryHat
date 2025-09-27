import { StorageProvider } from '../constants/enums';

/**
 * Represents the credentials used for external storage providers.
 */
export interface StorageCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;
  cloudFrontDistributionId?: string;
  cloudFrontDomainName?: string;
}

/**
 * Base structure for the storage configuration.
 */
export interface StorageConfig {
  provider: StorageProvider;
  credentials?: StorageCredentials;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
