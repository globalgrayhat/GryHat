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
