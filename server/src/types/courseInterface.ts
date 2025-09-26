
import { Question } from './lesson';


export type VideoSource = 'local' | 's3' | 'youtube' | 'vimeo';


export type CourseStatus = 'draft' | 'pending' | 'approved' | 'rejected';


export interface FileRef {
  
  name: string;
  
  url: string;
  
  key?: string;
}


export interface BaseCourseFields {
  title: string;
  duration: number | string;

  
  categoryId?: string;
  subcategoryId?: string;
  category?: string;

  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;

  tags?: string[] | string;
  price?: number | string;
  isPaid?: boolean | string;

  about?: string;
  description?: string;

  syllabus?: string[] | string;
  requirements?: string[] | string;

  
  thumbnail?: FileRef;
  introduction?: FileRef;
  guidelines?: FileRef;

  
  videoSource?: VideoSource;   // 'local' | 's3' | 'youtube' | 'vimeo'
  videoUrl?: string;           // used with youtube/vimeo

  
  introductionKey?: string;

  
  resources?: FileRef[];
}

export interface EditCourseInfo extends Partial<BaseCourseFields> {
  instructorId?: string;
  enrollmentCount?: number;
  rating?: number;
  isVerified?: boolean;
  enrollmentLimit?: number;
  completionStatus?: number;
  resources?: FileRef[];
}

export interface AddCourseInfoInterface extends BaseCourseFields {
  
  instructorId?: string;
  rating?: number;
  isVerified?: boolean;
}


export interface CourseInterface extends AddCourseInfoInterface {
  _id: string;
  coursesEnrolled: string[];
  status: CourseStatus;
  rejectionReason?: string | null;

  
  thumbnailUrl?: string;
  introductionUrl?: string;
  guidelinesUrl?: string;
}


export interface AddQuizInfoInterface {
  courseId: string;
  lessonId: string;
  questions: Question[];
}
export interface EditQuizInfoInterface {
  courseId?: string;
  lessonId?: string;
  questions: Question[];
}


export interface BaseLessonFields {
  title: string;
  description: string;
  contents: string[] | string;
  duration: number | string;
  about?: string;

  
  isPreview?: boolean | string;

  
  videoTusKeys?: string[] | string;

  
  primaryVideoKey?: string;

  
  resources?: FileRef[];
}

export interface AddLessonInfo extends BaseLessonFields {
  courseId: string;
  
  instructorId?: string;
}

export interface EditLessonInfo extends Partial<BaseLessonFields> {}
