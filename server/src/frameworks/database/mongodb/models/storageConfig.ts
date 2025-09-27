// models/storageConfigModel.ts
import mongoose, { Schema } from 'mongoose';
import { StorageProvider } from '../../../../constants/enums';
import { StorageCredentials } from '../../../../types/storageConfig';

const StorageCredentialsSchema = new Schema<StorageCredentials>({
  accessKeyId: String,
  secretAccessKey: String,
  region: String,
  bucketName: String,
  cloudFrontDistributionId: String,
  cloudFrontDomainName: String,
}, { _id: false });

const StorageConfigSchema = new Schema({
  provider: {
    type: String,
    enum: Object.values(StorageProvider),
    required: true,
  },
  credentials: {
    type: StorageCredentialsSchema,
    required: false
  },
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

export const StorageConfigModel = mongoose.model('StorageConfig', StorageConfigSchema);
