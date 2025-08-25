import multer from 'multer';
import fs from 'fs';
import path from 'path';

// دالة لتحديد مجلد الرفع بناءً على نوع الملف
function getUploadPath(file: Express.Multer.File): string {
  let uploadPath: string;
  switch (file.fieldname) {
    case 'profilePic':
      uploadPath = path.join(__dirname, '../../../uploads/profilePics');  // مجلد للصور الشخصية
      break;
    case 'certificates':
      uploadPath = path.join(__dirname, '../../../uploads/certificates');  // مجلد للشهادات
      break;
    default:
      uploadPath = path.join(__dirname, '../../../uploads/others');  // مجلد للملفات الأخرى
  }

  // التأكد من وجود المجلد أو إنشائه إذا لم يكن موجودًا
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
}

// تكوين تخزين multer مع المجلدات الديناميكية
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = getUploadPath(file);  // تحديد المجلد المناسب
    cb(null, uploadPath);  // تعيين المجلد
  },
  filename: function (req, file, cb) {
    // تعيين اسم الملف باستخدام timestamp لتفادي التكرار
    cb(null, Date.now() + '-' + file.originalname.trim().replace(/\s+/g, '-'));
  }
});

// تكوين upload مع فحص للملفات
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);  // قبول جميع أنواع الملفات (يمكنك إضافة قيود إذا لزم الأمر)
  }
});

export default upload;
