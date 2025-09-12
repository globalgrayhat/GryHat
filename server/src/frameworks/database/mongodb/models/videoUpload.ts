import { Schema, model, Document } from 'mongoose';

export interface VideoUpload extends Document {
  uploadId: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

const videoUploadSchema = new Schema({
  uploadId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  error: String
});

export const VideoUploadModel = model<VideoUpload>('VideoUpload', videoUploadSchema);