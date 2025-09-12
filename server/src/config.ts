// Load environment variables from `.env` file
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration keys loaded from environment variables
 * Centralized configuration object to be used across the application
 */
const configKeys = {
  /** Optional Redis username for ACL-enabled servers */
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  /** Optional Redis password */
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  /** Disable Redis entirely and use in-memory cache instead */
  REDIS_DISABLE: process.env.REDIS_DISABLE,

  /** MongoDB connection URI */
  MONGO_DB_URL: process.env.DATABASE as string,

  /** Application port number */
  PORT: process.env.PORT,

  /** MongoDB database name */
  DB_NAME: process.env.DB_NAME,

  /** Base directory for file uploads */
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  /** JWT access token secret */
  JWT_SECRET: process.env.JWT_SECRET as string,

  /** JWT refresh token secret */
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,

  /** Application environment (development, production, etc.) */
  NODE_ENV: process.env.NODE_ENV as string,

  /** Google OAuth client ID (for social login) */
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,

  /** Google OAuth client secret */
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,

  /** Frontend origin allowed for CORS */
  ORIGIN_PORT: process.env.ORIGIN_PORT as string,

  /** NodeMailer email username (sender account) */
  EMAIL_NODE_MAILER: process.env.EMAIL_USERNAME as string,

  /** NodeMailer email password */
  PASSWORD_NODE_MAILER: process.env.EMAIL_PASSWORD as string,

  /** Default email sender name/address */
  FROM_EMAIL_NODE_MAILER: process.env.FROM_EMAIL as string,

  // ================== AWS S3 Configuration ===================

  /** AWS access key for S3 storage */
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,

  /** AWS secret key for S3 storage */
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY as string,

  /** AWS S3 bucket region */
  AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION as string,

  /** AWS S3 bucket name */
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME as string,

  /** AWS CloudFront distribution ID (used for cache invalidation) */
  CLOUDFRONT_DISTRIBUTION_ID: process.env.CLOUDFRONT_DISTRIBUTION_ID as string,

  /** CloudFront domain name (used for serving public files) */
  CLOUDFRONT_DOMAIN_NAME: process.env.CLOUDFRONT_DOMAIN_NAME as string,

  // ================== Stripe Payment Configuration ===================

  /** Stripe secret key for backend payment operations */
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,

  /** Stripe publishable key for frontend payment integration */
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,

  // ================== Miscellaneous ===================

  /** MongoDB Atlas cluster URL (optional or for multi-tenant setups) */
  DB_CLUSTER_URL: process.env.DB_CLUSTER_URL as string,

  /** Redis connection URL (for caching, sessions, etc.) */
  REDIS_URL: process.env.REDIS_URL as string,

  // ================== Swagger API Docs ===================

  /** Enable/disable Swagger UI */
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED as string,

  /** Swagger UI route path */
  SWAGGER_PATH: process.env.SWAGGER_PATH || '/api-docs',

  // ================== MyFatoorah Payment Gateway ===================

  /** MyFatoorah API base URL (use sandbox or live) */
  MYFATOORAH_API_URL: process.env.MYFATOORAH_API_URL as string,

  /** MyFatoorah API key/token */
  MYFATOORAH_API_KEY: process.env.MYFATOORAH_API_KEY as string,

  /** Payment success redirect URL (frontend route) */
  MYFATOORAH_CALLBACK_URL: process.env.MYFATOORAH_CALLBACK_URL as string,

  /** Payment failure redirect URL (frontend route) */
  MYFATOORAH_ERROR_URL: process.env.MYFATOORAH_ERROR_URL as string,

  /** Invoice expiration time in minutes (default: 60) */
  MYFATOORAH_INVOICE_TTL_MINUTES: process.env.MYFATOORAH_INVOICE_TTL_MINUTES || '60',

  /** Timezone for expiry calculation (default: Asia/Kuwait) */
  MYFATOORAH_TZ: process.env.MYFATOORAH_TZ || 'Asia/Kuwait',

  /** Time skew to prevent premature expiration (default: 30 seconds) */
  MYFATOORAH_TTL_SKEW_SECONDS: process.env.MYFATOORAH_TTL_SKEW_SECONDS || '30',

  /** MyFatoorah: KNET payment method ID (from dashboard) */
  MYFATOORAH_PMID_KNET: process.env.MYFATOORAH_PMID_KNET,

  /** MyFatoorah: VISA payment method ID (from dashboard) */
  MYFATOORAH_PMID_VISA: process.env.MYFATOORAH_PMID_VISA,

  /** MyFatoorah: MasterCard payment method ID (optional) */
  MYFATOORAH_PMID_MASTERCARD: process.env.MYFATOORAH_PMID_MASTERCARD,

  /** Default currency for MyFatoorah transactions */
  MYFATOORAH_DEFAULT_CURRENCY: process.env.MYFATOORAH_DEFAULT_CURRENCY || 'KWD',

  /*
   * Deprecated: The storage provider is configured dynamically via the API.
   * Kept here for backwards compatibility only.
   */
  // STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 's3',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
TUS_UPLOAD_PATH: process.env.TUS_UPLOAD_PATH || './uploads/tus',
MULTER_UPLOAD_PATH: process.env.MULTER_UPLOAD_PATH || './uploads/multer',
MAX_LIGHT_FILE_SIZE: parseInt(process.env.MAX_LIGHT_FILE_SIZE || '2097152'),
  /** Maximum allowed size for profile picture uploads (default: 5MB) */
  MAX_PROFILE_PIC_SIZE: parseInt(process.env.MAX_PROFILE_PIC_SIZE || '5242880'),

  /** Maximum allowed size for certificate uploads (default: 10MB) */
  /**
   * Maximum allowed size for certificate uploads.
   * Default is 100MB (104857600 bytes) to accommodate large scanned documents or PDFs.
   */
  MAX_CERTIFICATE_FILE_SIZE: parseInt(process.env.MAX_CERTIFICATE_FILE_SIZE || '104857600'),

  /**
   * Base directory for storing files uploaded during registration (e.g. profile
   * pictures and certificates). Separates these assets from LMS course
   * materials. Defaults to './uploads/registration'.
   */
  REGISTRATION_UPLOAD_PATH: process.env.REGISTRATION_UPLOAD_PATH || './uploads/registration',

  /**
   * Base directory for storing LMS course resources (videos, documents, etc.).
   * Defaults to './uploads/courses'. Separate from registration assets.
   */
  LMS_UPLOAD_PATH: process.env.LMS_UPLOAD_PATH || './uploads/courses',

  /** Maximum allowed size for generic LMS file uploads (default: 6GB) */
  MAX_LMS_FILE_SIZE: parseInt(process.env.MAX_LMS_FILE_SIZE || String(6 * 1024 * 1024 * 1024)),

  /** Maximum allowed size for LMS document uploads (default: 1GB) */
  MAX_LMS_DOCUMENT_SIZE: parseInt(process.env.MAX_LMS_DOCUMENT_SIZE || String(1 * 1024 * 1024 * 1024)),
  GOOGLE_DRIVE_CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  GOOGLE_DRIVE_REDIRECT_URI: process.env.GOOGLE_DRIVE_REDIRECT_URI,
  DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN,
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
};

export default configKeys;
