import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * خدمة لتخزين الملفات في النظام المحلي.
 * محاكاة لـ S3 API للمرونة.
 */
export const localStorageService = () => {
  const uploadDir = path.resolve(process.cwd(), 'uploads');  // تحديد المجلد الذي سيتم فيه تخزين الملفات

  /**
   * توليد اسم ملف عشوائي لتجنب التصادم.
   * يتم الاحتفاظ بالامتداد الأصلي للملف.
   */
  const generateFilename = (originalName: string): string => {
    const randomString = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    return `${randomString}${ext}`;
  };

  /**
   * التحقق من حجم الملف إذا كان يتجاوز الحد المسموح به (10 ميجابايت في هذه الحالة).
   */
  const checkFileSize = (file: Express.Multer.File) => {
    const MAX_SIZE = 10 * 1024 * 1024;  // 10 ميجابايت بالبايت
    if (file.size > MAX_SIZE) {
      throw new Error('File is too large. Maximum size is 10MB');
    }
  };

  /**
   * رفع الملف إلى النظام المحلي وإرجاع اسم الملف.
   */
  const uploadFile = async (file: Express.Multer.File) => {
    // التأكد من أن الملف والـ Buffer موجودان
    if (!file || !file.buffer) {
      throw new Error('File or file buffer is undefined');
    }

    // التحقق من حجم الملف
    checkFileSize(file);

    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filename = generateFilename(file.originalname);
    const filePath = path.join(uploadDir, filename);

    // تحويل Buffer إلى Uint8Array قبل الكتابة
    const uint8 = new Uint8Array(file.buffer);

    try {
      // كتابة الملف إلى الخادم
      await fs.promises.writeFile(filePath, uint8);
      return {
        name: file.originalname,
        key: filename
      };
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Error saving the file to the server');
    }
  };

  /**
   * رفع الملف وإرجاع URL للوصول إلى الملف.
   */
  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const result = await uploadFile(file);
    return {
      ...result,
      url: `/uploads/${result.key}`
    };
  };

  /**
   * إرجاع المسار المطلق للملف باستخدام المفتاح الخاص به.
   */
  const getFile = async (fileKey: string) => {
    return path.join(uploadDir, fileKey);
  };

  /**
   * إرجاع تدفق القراءة لملف الفيديو (مفيد لبث الفيديو).
   */
  const getVideoStream = async (key: string): Promise<NodeJS.ReadableStream> => {
    const filePath = path.join(uploadDir, key);
    return fs.createReadStream(filePath);
  };

  /**
   * بالنسبة للتخزين المحلي، لا يوجد URL لـ CloudFront، بل نستخدم المسار النسبي.
   */
  const getCloudFrontUrl = async (fileKey: string): Promise<string> => {
    return `/uploads/${fileKey}`;
  };

  /**
   * حذف الملف من النظام المحلي.
   */
  const removeFile = async (fileKey: string) => {
    const filePath = path.join(uploadDir, fileKey);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error('File not found:', err);
    }
  };

  return {
    uploadFile,
    uploadAndGetUrl,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type LocalStorageService = typeof localStorageService;
