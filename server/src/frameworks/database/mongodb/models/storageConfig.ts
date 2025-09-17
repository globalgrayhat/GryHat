<<<<<<< HEAD
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
=======
import mongoose, { Document, Model } from 'mongoose';
import { StorageProvider } from '../../../../constants/enums';

const StorageConfigSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: Object.values(StorageProvider),
      required: true,
      default: StorageProvider.S3
    },
    credentials: {
      accessKeyId: { type: String },
      secretAccessKey: { type: String },
      region: { type: String },
      bucketName: { type: String },
      cloudFrontDistributionId: { type: String },
      cloudFrontDomainName: { type: String }
    }
  },
  {
    timestamps: true
  }
);

export interface StorageConfigDocument extends Document {
  provider: StorageProvider;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    bucketName?: string;
    cloudFrontDistributionId?: string;
    cloudFrontDomainName?: string;
  };
}

const StorageConfigModel: Model<StorageConfigDocument> =
  mongoose.models.StorageConfig ||
  mongoose.model<StorageConfigDocument>('StorageConfig', StorageConfigSchema);

export default StorageConfigModel;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
