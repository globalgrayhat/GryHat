import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import {
  SavedInstructorInterface,
  InstructorInterface
} from '../../../types/instructorInterface';
import AppError from '../../../utils/appError';
import { InstructorDbInterface } from '../../../app/repositories/instructorDbRepository';
import { AuthServiceInterface } from '../../../app/services/authServicesInterface';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';
import { UserRole } from '../../../constants/enums';

// Flexible storage provider (Local/S3) via cloud service
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { CloudServiceImpl } from '../../../frameworks/services';

/** Sanitize any user-provided string for use inside storage paths or keys. */
const safeName = (s: string) =>
  String(s || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 128);

/** Build a canonical base key for instructor assets. */
const buildInstructorBaseKey = (email?: string) => {
  const emailKey = safeName(email || Date.now().toString());
  return `instructors/${emailKey}`;
};

/**
 * Upload a single file to a specific key if supported, else fallback to generic upload.
 * Always returns a normalized shape { name, url, key }.
 */
const uploadAtKeyOrDefault = async (
  cloud: ReturnType<typeof cloudServiceInterface>,
  file: Express.Multer.File,
  key: string
) => {
  const up =
    (await (cloud as any).uploadAtPath?.(file, key)) ??
    (await cloud.uploadAndGetUrl(file));
  return {
    name: file.originalname,
    url: (up as any).url,
    key: (up as any).key ?? key
  };
};

/**
 * Attach uploaded assets (profilePic, certificates) to instructor payload in-place.
 * - Uses clean, deterministic foldering
 *   - instructors/{email}/profile/<file>
 *   - instructors/{email}/certificates/<file>
 */
const attachUploadsToInstructor = async (
  instructor: InstructorInterface,
  files: Record<string, Express.Multer.File[]>
) => {
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const baseKey = buildInstructorBaseKey(instructor.email);

  // Profile picture (optional)
  const profileFiles = Array.isArray(files?.profilePic) ? files.profilePic : [];
  if (profileFiles[0]) {
    const f = profileFiles[0];
    const key = `${baseKey}/profile/${safeName(f.originalname)}`;
    (instructor as any).profilePic = await uploadAtKeyOrDefault(cloud, f, key);
  }

  // Certificates (optional list)
  const certs = Array.isArray(files?.certificates) ? files.certificates : [];
  if (certs.length) {
    const uploaded = await Promise.all(
      certs.map(async (f) =>
        uploadAtKeyOrDefault(
          cloud,
          f,
          `${baseKey}/certificates/${safeName(f.originalname)}`
        )
      )
    );
    (instructor as any).certificates = uploaded;
  } else {
    (instructor as any).certificates = [];
  }
};

/** -------------------------------------------------------
 * Use-cases
 * ----------------------------------------------------- */

/**
 * Register an instructor:
 * - Validates duplicate email.
 * - Uploads optional assets (profilePic + certificates) using flexible storage.
 * - Hashes password.
 * - Persists the instructor.
 * Returns a simple status/message object (kept backward compatible).
 */
export const instructorRegister = async (
  instructor: InstructorInterface,
  files: { [fieldname: string]: Express.Multer.File[] },
  instructorRepository: ReturnType<InstructorDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  // Normalize email (lowercased) and ensure arrays are present
  instructor.email = String(instructor?.email || '').toLowerCase().trim();
  (instructor as any).certificates = Array.isArray((instructor as any).certificates)
    ? (instructor as any).certificates
    : [];

  // Check duplicates
  const exists = await instructorRepository.getInstructorByEmail(instructor.email);
  if (exists) {
    throw new AppError(
      'Instructor with the same email already exists..!',
      HttpStatusCodes.CONFLICT
    );
  }

  // Handle uploads (DRY)
  await attachUploadsToInstructor(instructor, files || {});

  // Hash password if provided
  const plain = String((instructor as any).password || '');
  if (plain) {
    (instructor as any).password = await authService.hashPassword(plain);
  }

  // Persist
  const saved = await instructorRepository.addInstructor(instructor);

  return saved
    ? { status: true, message: 'Successfully registered!' }
    : { status: false, message: 'Failed to register!' };
};

export const instructorLogin = async (
  email: string,
  password: string,
  instructorRepository: ReturnType<InstructorDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  const instructor: SavedInstructorInterface | null =
    await instructorRepository.getInstructorByEmail(email);
  if (!instructor) {
    throw new AppError(
      "Instructor doesn't exist, please register",
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  if (!instructor.isVerified) {
    throw new AppError(
      'Your details is under verification please try again later',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  if (!instructor.password) {
    throw new AppError(
      'Password is not set for this instructor',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const isPasswordCorrect = await authService.comparePassword(
    password,
    instructor.password
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your password is incorrect. Please try again',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const payload = {
    Id: instructor._id,
    email: instructor.email,
    role: UserRole.Instructor
  };
  await refreshTokenRepository.deleteRefreshToken(instructor._id);
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
  await refreshTokenRepository.saveRefreshToken(
    instructor._id,
    refreshToken,
    expirationDate
  );
  return {
    accessToken,
    refreshToken
  };
};
