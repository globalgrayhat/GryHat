export interface InstructorInterface {
  firstName: string;
  lastName: string;
  profilePic: {
    name: string;
    key?: string; // لتخزين الـ key الخاص بالملف في سحابة مثل S3
    url?: string; // لتخزين الـ URL للصورة الشخصية
  };
  email: string;
  mobile: number; // يمكن تحويله إلى string إذا كان سيشمل رموز البلد
  qualifications: string;
  subjects: string[]; // يجب أن يكون Array لأنه يمكن أن يحتوي على أكثر من موضوع
  experience: string;
  skills: string;
  about: string;
  password: string;
  certificates: Certificate[]; // قائمة من الشهادات
}

export interface Certificate {
  name: string;
  url?: string; // رابط الشهادة بعد رفعها
}

export interface SavedInstructorInterface extends InstructorInterface {
  _id: string; // معرف المدرب بعد الحفظ في قاعدة البيانات
  isVerified: boolean; // حالة التحقق
  dateJoined: Date; // تاريخ الانضمام
  coursesCreated: Array<string>; // قائمة بالدورات التي تم إنشاؤها من قبل المدرب
  profileUrl: string; // الرابط الكامل للصورة الشخصية
}
