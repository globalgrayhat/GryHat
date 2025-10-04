import express from 'express';
import { z } from 'zod';
import jwtAuthMiddleware from '../middlewares/userAuth'; // Middleware for JWT authentication
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware'; // Middleware for role-based access control
import { UserRole } from '../../../constants/enums'; // Enum for user roles
import multer from 'multer'; // Multer for handling file uploads
import { lmsUploadService } from '../../services/lmsUploadService'; // LMS upload service for handling chunked uploads
import { DirectUploadSchema, ChunkInitSchema, ChunkUploadSchema, ChunkCompleteSchema } from '../../../shared/upload/validators'; // Import schemas for validation

const upload = multer({ storage: multer.memoryStorage() }); // Configure Multer to store files in memory

const router = express.Router(); // Initialize Express router
const svc = lmsUploadService(); // Instantiate the LMS upload service

/**
 * Initialize a chunked upload session.
 * Body: { courseId, lessonId?, kind, filename, mime, size, sha256? }
 * Returns: { uploadId }
 */
router.post(
  '/chunk/init',
  jwtAuthMiddleware, // Protect this route with JWT authentication
  roleCheckMiddleware([UserRole.Admin, 'owner', UserRole.Instructor]), // Check if the user has appropriate role
  async (req, res, next) => {
    try {
      const parsed = ChunkInitSchema.parse(req.body); // Validate the body with ChunkInitSchema
      const { uploadId } = await svc.initChunk(parsed); // Initialize the chunked upload session
      res.json({ status: 'ok', uploadId }); // Return the uploadId as a response
    } catch (e: any) { next(e); } // Handle errors
  }
);

/** 
 * Upload a chunk file part. 
 * Form-data: (file) 'chunk'; Query: partNumber
 */
router.post(
  '/chunk/:uploadId',
  jwtAuthMiddleware,
  roleCheckMiddleware([UserRole.Admin, 'owner', UserRole.Instructor]),
  upload.single('chunk'),
  async (req, res, next) => {
    try {
      // Parse the incoming data with file included
      const parsed = ChunkUploadSchema.parse({
        uploadId: req.params.uploadId,
        partNumber: Number(req.query.partNumber || req.body.partNumber),
        file: req.file, // Attach the file here
      });

      // Call the service with the parsed data, including the file
      const result = await svc.putChunk(parsed.uploadId, parsed.partNumber, parsed.file);

      res.json({ status: 'ok', ...result });
    } catch (e: any) {
      next(e);
    }
  }
);

/** 
 * Complete a chunk session and merge parts. 
 * Returns: { uploadId, size }
 */
router.post(
  '/chunk/:uploadId/complete',
  jwtAuthMiddleware, // Protect this route with JWT authentication
  roleCheckMiddleware([UserRole.Admin, 'owner', UserRole.Instructor]), // Check if the user has appropriate role
  async (req, res, next) => {
    try {
      const uploadId = req.params.uploadId; // Extract uploadId from route parameters
      const result = await svc.completeChunk(uploadId); // Complete the chunked upload and merge parts
      res.json({ status: 'ok', ...result }); // Return the result with status
    } catch (e: any) { next(e); } // Handle errors
  }
);

export default router; // Export the router for use in other parts of the application
