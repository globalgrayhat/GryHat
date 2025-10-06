import 'dotenv/config';

/**
 * Helper to parse environment variable as number
 */
const num = (v: any, d: number) => (v ? Number(v) : d);

const configKeys = {
  // ================== Core Environment ===================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: num(process.env.PORT, 3000),
  
  // ================== CORS =================== 
  CORS_ORIGINS : process.env.CORS_ORIGINS_URL || 'http://localhost:3000',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS_BOLL || 'http://localhost:3000',

  // ================== Base URLs ===================
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
 

  // ================== MongoDB ===================
  MONGO_DB_URL: process.env.DATABASE as string,
  DB_NAME: process.env.DB_NAME,

  // ================== Redis ===================
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DISABLE: process.env.REDIS_DISABLE,
  REDIS_URL: process.env.REDIS_URL,

  // ================== JWT ===================
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,

  // ================== Email / NodeMailer ===================
  EMAIL_NODE_MAILER: process.env.EMAIL_USERNAME as string,
  PASSWORD_NODE_MAILER: process.env.EMAIL_PASSWORD as string,
  FROM_EMAIL_NODE_MAILER: process.env.FROM_EMAIL as string,

  // ================== OAuth ===================
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_DRIVE_CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  GOOGLE_DRIVE_REDIRECT_URI: process.env.GOOGLE_DRIVE_REDIRECT_URI,

  // ================== File Upload Config ===================
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  UPLOAD_ROOT: process.env.UPLOAD_ROOT || './uploads',
  LMS_UPLOAD_ROOT: process.env.LMS_UPLOAD_ROOT || './uploads/courses',
  REG_UPLOAD_ROOT: process.env.REG_UPLOAD_ROOT || './uploads/registration',
  TUS_UPLOAD_PATH: process.env.TUS_UPLOAD_PATH || './uploads/tus',
  MULTER_UPLOAD_PATH: process.env.MULTER_UPLOAD_PATH || './uploads/multer',

  LOCAL_CHUNK_DIR: process.env.LOCAL_CHUNK_DIR || './uploads/.chunks',
  LOCAL_CHUNK_MAX_PART: num(process.env.LOCAL_CHUNK_MAX_PART, 10 * 1024 * 1024), // 10MB

  // ================== File Size Limits ===================
  MAX_LIGHT_FILE_SIZE: num(process.env.MAX_LIGHT_FILE_SIZE, 2 * 1024 * 1024), // 2MB
  MAX_PROFILE_PIC_SIZE: num(process.env.MAX_PROFILE_PIC_SIZE, 5 * 1024 * 1024), // 5MB
  MAX_CERTIFICATE_FILE_SIZE: num(process.env.MAX_CERTIFICATE_FILE_SIZE, 100 * 1024 * 1024), // 100MB
  MAX_LMS_FILE_SIZE: num(process.env.MAX_LMS_FILE_SIZE, 6 * 1024 * 1024 * 1024), // 6GB
  MAX_LMS_DOCUMENT_SIZE: num(process.env.MAX_LMS_DOCUMENT_SIZE, 1 * 1024 * 1024 * 1024), // 1GB
  MAX_LMS_MEDIA_SIZE: num(process.env.MAX_LMS_MEDIA_SIZE, 1024 * 1024 * 1024), // 1GB

  // ================== AWS / CloudFront ===================
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION || '',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || '',
  CLOUDFRONT_DISTRIBUTION_ID: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
  CLOUDFRONT_DOMAIN_NAME: process.env.CLOUDFRONT_DOMAIN_NAME || '',

  // ================== Vimeo / Dropbox ===================
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN || 'dasdadadad',
  DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN || 'asdadasdasdada',

  // ================== Stripe ===================
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // ================== MyFatoorah ===================
  MYFATOORAH_API_URL: process.env.MYFATOORAH_API_URL || '',
  MYFATOORAH_API_KEY: process.env.MYFATOORAH_API_KEY || '',
  MYFATOORAH_CALLBACK_URL: process.env.MYFATOORAH_CALLBACK_URL || '',
  MYFATOORAH_ERROR_URL: process.env.MYFATOORAH_ERROR_URL || '',
  MYFATOORAH_INVOICE_TTL_MINUTES: process.env.MYFATOORAH_INVOICE_TTL_MINUTES || '60',
  MYFATOORAH_TZ: process.env.MYFATOORAH_TZ || 'Asia/Kuwait',
  MYFATOORAH_TTL_SKEW_SECONDS: process.env.MYFATOORAH_TTL_SKEW_SECONDS || '30',
  MYFATOORAH_PMID_KNET: process.env.MYFATOORAH_PMID_KNET,
  MYFATOORAH_PMID_VISA: process.env.MYFATOORAH_PMID_VISA,
  MYFATOORAH_PMID_MASTERCARD: process.env.MYFATOORAH_PMID_MASTERCARD,
  MYFATOORAH_DEFAULT_CURRENCY: process.env.MYFATOORAH_DEFAULT_CURRENCY || 'KWD',

  // ================== Swagger ===================
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED || 'true',
  SWAGGER_PATH: process.env.SWAGGER_PATH || '/api-docs',

  // ================== Deprecated / Fallback ===================
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  DB_CLUSTER_URL: process.env.DB_CLUSTER_URL || '',

  
};

export default configKeys;
