export interface FileRef {
    name: string;
    url?: string;
    key?: string;
  }
  
  export interface LessonMedia {
    name: string;   // "youtube" | "vimeo" | "s3" | "local" | "lessonVideo" | ...
    url?: string;   // used by youtube/vimeo/local
    key?: string;   // used by s3/lessonVideo
  }
  
  export interface LessonDto {
    _id: string;
    title: string;
    description: string;
    contents?: string[];
    duration?: number;
    courseId: string;
    isPreview: boolean;
    resources?: FileRef[];
    videoTusKeys?: string[];
    media: LessonMedia[];
    createdAt?: string;
    updatedAt?: string;
  }
  