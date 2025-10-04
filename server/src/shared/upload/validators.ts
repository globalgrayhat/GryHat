import { z } from 'zod';

// Define COURSE_KINDS as a readonly tuple with specific string values
// This makes sure the elements in the array are treated as literal types, 
// preventing any modification to the values.
export const COURSE_KINDS = ['images', 'videos', 'documents', 'archives', 'assets', 'introduction'] as const;

export const DirectUploadSchema = z.object({
  // The courseId is required and must be a non-empty string
  courseId: z.string().min(1, 'courseId is required'),
  
  // Optional lessonId, if provided, must be a string
  lessonId: z.string().optional(),
  
  // The 'kind' field is validated to ensure it matches one of the predefined values in COURSE_KINDS
  kind: z.enum(COURSE_KINDS), 
});

export const ChunkInitSchema = z.object({
  // The courseId is required and must be a non-empty string
  courseId: z.string().min(1),
  
  // Optional lessonId, if provided, must be a string
  lessonId: z.string().optional(),
  
  // The 'kind' field is validated to ensure it matches one of the predefined values in COURSE_KINDS
  kind: z.enum(COURSE_KINDS),
  
  // The filename is required and must be a non-empty string
  filename: z.string().min(1),
  
  // Mime type is required and must be a non-empty string
  mime: z.string().min(1),
  
  // Size of the file must be a positive integer
  size: z.number().int().positive(),
  
  // Optional sha256 hash, validated to match the pattern for a 64-character hex string
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
});

export const ChunkUploadSchema = z.object({
    uploadId: z.string().min(1),
    partNumber: z.coerce.number().int().positive(), // Ensures partNumber is a positive integer
    file: z.any(), // Use `z.any()` to accept any file type (multer stores files in memory as Buffer)
  });

export const ChunkCompleteSchema = z.object({
  // The uploadId is required and must be a non-empty string
  uploadId: z.string().min(1),
});

