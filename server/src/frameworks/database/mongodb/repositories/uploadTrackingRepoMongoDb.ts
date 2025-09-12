import { VideoUploadModel } from '../models/videoUpload';

export const uploadTrackingRepoMongoDb = () => {
  const createUploadRecord = async (uploadData: Partial<any>) => {
    return await VideoUploadModel.create(uploadData);
  };

  const updateUploadStatus = async (uploadId: string, status: string, error?: string) => {
    return await VideoUploadModel.findOneAndUpdate(
      { uploadId },
      { status, error, uploadedAt: new Date() },
      { new: true }
    );
  };

  const getUserUploads = async (userId: string, startDate?: Date, endDate?: Date) => {
    const query: any = { userId };
    
    if (startDate && endDate) {
      query.uploadedAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return await VideoUploadModel.find(query).sort({ uploadedAt: -1 });
  };

  const getDailyUploadStats = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await VideoUploadModel.aggregate([
      {
        $match: {
          uploadedAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalUploads: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          averageUploadTime: { $avg: '$uploadDuration' }
        }
      }
    ]);
  };

  return {
    createUploadRecord,
    updateUploadStatus,
    getUserUploads,
    getDailyUploadStats
  };
};

export type UploadTrackingRepositoryMongoDb = typeof uploadTrackingRepoMongoDb;