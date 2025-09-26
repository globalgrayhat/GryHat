import { FileRef } from './courseInterface';

export interface CreateLessonInterface {
  title: string;
  description: string;
  contents: string[];      
  duration: number;      
  about?: string;

  instructorId: string;
  courseId: string;

  // Preview gating
  isPreview?: boolean;

  // Lesson resources/attachments
  resources?: FileRef[];

  // TUS info (persisted)
  videoTusKeys?: string[];
  primaryVideoKey?: string;

  // Back-compat field
  media?: FileRef[];

  videoSource?: 'tus' | 'youtube' | 'vimeo' | 'local' | 's3' | '';
  videoUrl?: string;       // youtube/vimeo/local/s3 link
  videoFile?: string;      // single TUS id
  questions?: Question[];
}

export interface EditLessonInterface {
  title?: string;
  description?: string;
  contents?: string[];
  duration?: number;
  about?: string;
  courseId?: string;
  isPreview?: boolean;
  resources?: FileRef[];

  videoTusKeys?: string[];
  primaryVideoKey?: string;

  media?: FileRef[];

  videoSource?: 'tus' | 'youtube' | 'vimeo' | 'local' | 's3' | '';
  videoUrl?: string;
  videoFile?: string;

  questions?: Question[];
}

export interface Question {
  question: string;
  options: Option[];
}

interface Option {
  option: string;
  isCorrect: boolean;
}
