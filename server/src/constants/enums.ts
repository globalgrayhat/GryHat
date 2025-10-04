// server/src/constants/enums.ts
export enum UserRole {
  Admin = 'admin',
  Instructor = 'instructor',
  Student = 'student',
  Owner = 'owner'
  }
  
  
  export enum StorageProvider {
  S3 = 's3',
  Local = 'local',
  YouTube = 'youtube',
  Vimeo = 'vimeo'
  }
  
  
  // Kind buckets used for foldering and validation
  export enum FileKind {
  Image = 'image',
  Video = 'video',
  Document = 'document',
  Archive = 'archive',
  Other = 'other'
  }
  
  
  export const VideoSource = StorageProvider;
  export const AdditionalRoleOwner = UserRole.Owner;