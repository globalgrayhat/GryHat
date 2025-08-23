/**
 * Global enumerations used throughout the application. Keeping all enums in a
 * single location promotes reuse and makes it easy to discover the available
 * options for various pieces of functionality. Additional values can be added
 * here without breaking the rest of the codebase.
 */

/**
 * Roles supported by the authentication and authorization layer. Converting
 * string literals into a typed enum helps prevent typos and improves
 * autocompletion support. Use these values whenever comparing or assigning
 * roles on a user.
 */
export enum UserRole {
  /** Full access to administrative functionality. */
  Admin = 'admin',
  /** Instructors can create and manage courses and lessons. */
  Instructor = 'instructor',
  /** Students can enrol in courses and view content. */
  Student = 'student'
}

/**
 * Storage providers for media uploads. This enum is used to determine which
 * underlying implementation should handle a file upload. When adding new
 * providers (for example, FTP or another cloud provider), simply append a
 * value here and extend the service selection logic accordingly.
 */
export enum StorageProvider {
  /** Store files on AWS S3. */
  S3 = 's3',
  /** Store files on the local filesystem. */
  Local = 'local',
  /** Use a publicly accessible YouTube link for videos. */
  YouTube = 'youtube',
  /** Use a publicly accessible Vimeo link for videos. */
  Vimeo = 'vimeo'
}

/**
 * Video sources for lessons or courses. This is a convenience alias to make
 * clear intent when specifying a video source, distinct from general
 * `StorageProvider` since not all sources involve uploading.
 */
export const VideoSource = StorageProvider;