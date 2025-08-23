import mongoose, { Document, Model } from 'mongoose';
import { StorageProvider } from '../../../../constants/enums';

/**
 * Schema definition for persisting storage configuration in MongoDB. The
 * configuration is stored as a single document and controls how uploads
 * are handled. The provider field is limited to the values defined in
 * `StorageProvider`. For non-local providers, the credentials field is
 * required to include at least the keys necessary to authenticate with
 * the underlying service (e.g. accessKeyId and secretAccessKey for AWS).
 */
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