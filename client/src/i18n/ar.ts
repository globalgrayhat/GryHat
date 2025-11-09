/* eslint-disable no-dupe-keys */
/**
 * Arabic translations as a TypeScript module.
 */

const ar = {
  welcomeBack: "مرحبًا بعودتك",
  signInContinue: "قم بتسجيل الدخول للمتابعة",
  createAccount: "أنشئ حسابك",
  registerStart: "سجل لبدء التعلم",
  becomeInstructor: "كن مدربًا",
  instructorTagline: "شارك معرفتك مع العالم",
  adminSignIn: "تسجيل دخول المسؤول",
  adminTagline: "صلاحيات إدارية",
  becomeInstructorTagline: "انضم لنا وابدأ التدريس اليوم",

  nav: {
    home: "الرئيسية",
    courses: "الدورات",
    tutors: "المدربون",
    community: "المجتمع",
    about: "حول",
    contact: "اتصل بنا",
    login: "تسجيل الدخول",
    register: "التسجيل",
    instructorLogin: "دخول المدرب",
    settings: "الإعدادات",
    students: "الطلاب",
    instructors: "المدربون",
    categories: "الأقسام",
    coursesNav: "الدورات",
    admin: "المشرف",
    adminLogin: "دخول المشرف",
  },

  home: {
    trendingCourses: "الدورات الرائجة",
    recommendedCourses: "الدورات المقترحة لك",
    viewMore: "عرض المزيد",
    viewAll: "عرض الكل",
    browseAll: "تصفح جميع الدورات",
    empty: {
      trending: "لا توجد دورات رائجة حاليًا.",
      recommended: "لا توجد توصيات لك بعد.",
    },
    errors: {
      trendingFail: "تعذر تحميل الدورات الرائجة الآن.",
      recommendedFail: "تعذر تحميل الدورات المقترحة الآن.",
    },
  },

  footer: {
    explore: "استكشف",
    support: "الدعم",
    courses: "الدورات",
    instructors: "المدربون",
    community: "المجتمع",
    articles: "المقالات",
    contact: "اتصل بنا",
    helpCenter: "مركز المساعدة",
    platformName: "المنصة الأكاديمية",
  },

  auth: {
    registerTitle: "إنشاء حساب",
    personalInfo: "معلومات شخصية",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    mobile: "رقم الجوال",
    qualifications: "المؤهلات",
    qualification: "المؤهل",
    subjects: "المواد",
    experience: "الخبرة",
    skills: "المهارات",
    about: "نبذة عنك",
    photo: "صورة",
    certificate: "شهادة",
    certificates: "الشهادات",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    uploadFile: "رفع ملف",
    uploadPhoto: "رفع صورة",
    uploadCertificate: "رفع شهادة",
    dragOrDrop: "أو قم بالسحب والإفلات",
    fileTypeInfo: "PNG، JPG، GIF حتى 10 ميجابايت",
    signUp: "إنشاء حساب",
    signIn: "تسجيل الدخول",
    cancel: "إلغاء",
    studentLogin: "تسجيل دخول الطالب",
    accessAccount: "الوصول إلى الحساب",
    haveAccount: "لديك حساب بالفعل؟",
    blockedTitle: "محظور",
    blockedMessage:
      "لقد تم حظر حسابك. يرجى الاتصال بالدعم للحصول على المساعدة.",
  },

  tutors: {
    title: "قائمة المدربين",
    subtitle: "تعرّف على خبراء Gray Hat",
    searchPlaceholder: "ابحث عن المدربين...",
    noResults: "لم يتم العثور على مدربين.",
  },

  adminCourses: {
    title: "الدورات",
    course: "الدورة",
    category: "القسم",
    instructor: "المدرب",
    price: "السعر",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
  },

  admin: {
    courses: "الدورات",
    coursesDescription: "إدارة جميع الدورات في المنصة",
    noCourses: "لا توجد دورات.",
    search: "بحث",
    settings: "الإعدادات",
    siteSettings: "إعدادات الموقع",
    profileSaved: "تم حفظ الملف الشخصي",
    name: "الاسم",
    email: "البريد الإلكتروني",
    save: "حفظ",
  },

  settings: {
    adminSettings: "إعدادات الإدارة",
    profileSettings: "إعدادات الملف الشخصي",
    siteSettings: "إعدادات الموقع",
    platformName: "اسم المنصة",
    platformNamePlaceholder: "أدخل اسم المنصة",
    loginOptions: "خيارات تسجيل الدخول",
    enableStudentLogin: "تفعيل تسجيل دخول/تسجيل الطلاب",
    enableInstructorLogin: "تفعيل تسجيل دخول/تسجيل المدربين",
    enableGoogleLogin: "تفعيل تسجيل الدخول عبر جوجل",
    saveSettings: "حفظ الإعدادات",
    saving: "جارٍ الحفظ...",
    editProfileInfo: "تعديل معلومات الحساب",
    profileSubtitle: "إدارة بياناتك الشخصية وكلمة المرور",
    accountInfo: "معلومات الحساب",
    changePassword: "تغيير كلمة المرور",
    errors: {
      platformNameRequired: "اسم المنصة لا يمكن أن يكون فارغًا",
    },
    successfullyUpdated: "تم تحديث الإعدادات بنجاح",
    updateFailed: "فشل في تحديث الإعدادات",
  },

  course: {
    title: "العنوان",
    category: "الفئة",
    price: "السعر",
    level: "المستوى",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    active: "نشط",
    pending: "قيد الانتظار",
    duration: "المدة",
    free: "مجانًا",
  },

  pagination: {
    previous: "السابق",
    next: "التالي",
  },

  profile: {
    loading: "جارٍ تحميل الملف الشخصي...",
    noChanges: "لا توجد تغييرات للتحديث",
    updatedSuccessfully: "تم تحديث الملف الشخصي بنجاح",
    updateFailed: "فشل في تحديث الملف الشخصي",
    edit: "تعديل الملف الشخصي",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    mobile: "رقم الجوال",
    changeAvatar: "الصورة الشخصية",
  },

  toast: {
    genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },

  common: {
    edit: "تعديل",
    delete: "حذف",
  },
};

export type ArTranslations = typeof ar;
export default ar;
