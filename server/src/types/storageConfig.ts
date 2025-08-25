import { StorageProvider } from '../constants/enums';

export interface StorageCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;
  cloudFrontDistributionId?: string;
  cloudFrontDomainName?: string;
}

export interface StorageConfig {
  provider: StorageProvider;
  credentials?: StorageCredentials;
}
