// --- FULLY CORRECTED FILE ---

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Writable } from 'stream';

/**
 * This service handles file storage on the local server disk.
 * CRITICAL FIX: It uses Node.js Streams to move files instead of reading them
 * into memory, which is essential for handling large file uploads and preventing timeouts.
 */
export const localStorageService = () => {
    const uploadDir = path.resolve(process.cwd(), 'uploads');

    /**
     * Moves a file from a temporary path to a final destination using streams.
     * This is highly memory-efficient.
     * @param sourcePath The temporary path of the uploaded file (from multer).
     * @param destinationPath The final path where the file should be saved.
     */
    const moveFileWithStream = (sourcePath: string, destinationPath: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(sourcePath);
            const writeStream = fs.createWriteStream(destinationPath);

            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve); // The 'finish' event confirms the write is complete.

            readStream.pipe(writeStream);
        });
    };
    
    /**
     * Generates a unique, random filename while preserving the original extension.
     * @param originalName The original filename from the upload.
     */
    const generateFilename = (originalName: string) => {
        const randomString = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(originalName);
        return `${randomString}${ext}`;
    };

    /**
     * Uploads a file to a specific relative key (path) under the main upload directory.
     * This is the core function that now uses streams.
     * @param file The multer file object.
     * @param key The relative path to save the file to (e.g., "courses/courseId/video.mp4").
     */
    const uploadAtPath = async (file: Express.Multer.File, key: string) => {
        // Multer must be configured to save files to disk for this to work.
        if (!file.path) {
            throw new Error('File path is missing. Ensure multer is configured to save files to disk.');
        }

        const destinationPath = path.join(uploadDir, key);
        // Ensure the destination directory exists.
        await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });

        // Move the file efficiently using streams.
        await moveFileWithStream(file.path, destinationPath);
        
        return { name: file.originalname, key };
    };

    /**
     * Uploads a file with a randomly generated name.
     * @param file The multer file object.
     */
    const uploadFile = async (file: Express.Multer.File) => {
        const filename = generateFilename(file.originalname);
        await uploadAtPath(file, filename);
        return { name: file.originalname, key: filename };
    };

    /**
     * Uploads a file and returns its public-facing URL.
     * @param file The multer file object.
     */
    const uploadAndGetUrl = async (file: Express.Multer.File) => {
        const result = await uploadFile(file);
        return { ...result, url: `/uploads/${result.key}` };
    };

    const getFile = async (fileKey: string) => path.join(uploadDir, fileKey);

    const getVideoStream = async (key: string) =>
        fs.createReadStream(path.join(uploadDir, key));

    const getCloudFrontUrl = async (fileKey: string) => `/uploads/${fileKey}`;

    const removeFile = async (fileKey: string) => {
        const filePath = path.join(uploadDir, fileKey);
        try { 
            await fs.promises.unlink(filePath); 
        } catch { 
            // Ignore if file doesn't exist.
        }
    };

    return {
        uploadFile,
        uploadAndGetUrl,
        uploadAtPath,
        getFile,
        getVideoStream,
        getCloudFrontUrl,
        removeFile
    };
};

export type LocalStorageService = typeof localStorageService;
