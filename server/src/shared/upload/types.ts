// Central list of allowed 'kind' folders for course assets.
// Matches required foldering: uploads/courses/{courseId}/{kind}/[lessonId]/originalName
export const COURSE_KINDS = [
    'images',
    'videos',
    'documents',
    'archives',
    'assets',
    'introduction'
  ] as const;
  
  export type CourseKind = (typeof COURSE_KINDS)[number];
  