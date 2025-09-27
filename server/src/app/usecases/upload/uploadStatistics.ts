import { UploadTrackingRepositoryMongoDb } from '../../../frameworks/database/mongodb/repositories/uploadTrackingRepoMongoDb';

export const getUploadStatistics = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  uploadTrackingRepo: ReturnType<UploadTrackingRepositoryMongoDb>
) => {
  const userUploads = await uploadTrackingRepo.getUserUploads(userId, startDate, endDate);
  
  const totalSize = userUploads.reduce((sum, upload) => sum + upload.fileSize, 0);
  const averageSize = userUploads.length > 0 ? totalSize / userUploads.length : 0;
  
  return {
    totalUploads: userUploads.length,
    totalSize,
    averageSize,
    uploadsByType: userUploads.reduce((acc: Record<string, number>, upload) => {
      const type = upload.fileType.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    dailyStats: await uploadTrackingRepo.getDailyUploadStats(new Date())
  };
};
