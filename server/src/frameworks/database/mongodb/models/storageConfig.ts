// server/src/frameworks/database/mongodb/models/storageConfig.ts
import { Schema, model } from 'mongoose';
import { StorageConfig } from '@src/types/storageConfig';
import { StorageProvider } from '../../../../constants/enums';

const CredentialsSchema = new Schema({
  accessKeyId: String,
  secretAccessKey: String,
  region: String,
  bucketName: String,
  cloudFrontDistributionId: String,
  cloudFrontDomainName: String
});

const storageConfigSchema = new Schema({
  provider: {
    type: String,
    enum: Object.values(StorageProvider),
    required: true
  },
  credentials: CredentialsSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default model<StorageConfig>('StorageConfig', storageConfigSchema);