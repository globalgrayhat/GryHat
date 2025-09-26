import { Schema, model } from 'mongoose';
import { UserRole } from '../../../../constants/enums';

// Extend the standard UserRole enum with the additional 'owner' role. Since
// the original enum does not include Owner we define a union of strings
// manually. Mongoose will use this array for the enum validation on the
// `role` field below. Keep this list in sync with the roles supported by
// the system (admin, instructor, student, owner).
const USER_ROLES = [
  UserRole.Admin,
  UserRole.Instructor,
  UserRole.Student,
  UserRole.Owner
] as const;

/**
 * Unified user schema. This file consolidates the previously separate
 * student, instructor and admin schemas into a single collection. A
 * discriminator is used to distinguish between roles while keeping a
 * common base document structure. Each discriminator inherits from the
 * base schema and may override validation or default values where
 * required. The underlying MongoDB collection is always `users`.
 */

// Shared sub‑documents used across roles
const ProfilePicSchema = new Schema(
  {
    name: { type: String },
    url: { type: String }
  },
  { _id: false }
);

const CertificateSchema = new Schema(
  {
    name: { type: String },
    url: { type: String }
  },
  { _id: false }
);

// Regular expression for validating email addresses.
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// Base user schema containing fields common to all roles. Specific roles may
// have additional fields declared via discriminators below. When adding
// properties here ensure that they apply to all types of users.
const baseUserSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: USER_ROLES
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Please enter a valid email']
    },
    password: {
      type: String,
      // Passwords are not required when signing in via Google.
      required: function (this: any) {
        return !this.isGoogleUser;
      },
      minlength: 4
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10‑digit mobile number']
    },
    profilePic: ProfilePicSchema,
    // Certificates apply primarily to instructors but may be attached to any
    // user type. The schema is kept generic to avoid tight coupling.
    certificates: [CertificateSchema],
    qualification: { type: String },
    subjects: [String],
    experience: { type: String },
    skills: { type: String },
    about: { type: String },
    interests: {
      type: [String],
      default: []
    },
    // Instructors may create courses while students enrol in courses. Both
    // fields live on the base schema so queries can determine relations
    // irrespective of role. Only the relevant field will be populated.
    coursesCreated: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    coursesEnrolled: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    rejected: { type: Boolean, default: false },
    rejectedReason: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: '' },
    dateJoined: { type: Date, default: Date.now },
    profileUrl: { type: String }
  },
  {
    discriminatorKey: 'role',
    collection: 'users'
  }
);

/**
 * Base model used for all users. Discriminators extend this model to
 * represent specific roles (admin, instructor, student, owner) while
 * still storing documents in a single collection. Do not export the
 * base model directly; instead export discriminators below.
 */
const BaseUser = model('User', baseUserSchema);

// Admin discriminator. Admins simply reuse the base schema but must have
// both email and password defined. Additional admin-specific fields can be
// added here in the future.
const AdminUser = BaseUser.discriminator(
  UserRole.Admin,
  new Schema({}, { _id: false })
);

// Instructor discriminator with fields required for instructors only. Note
// that password validation is deferred to the base schema. The fields
// defined here will override those in the base for instructor documents.
const InstructorUser = BaseUser.discriminator(
  UserRole.Instructor,
  new Schema(
    {
      profilePic: { type: ProfilePicSchema, required: true },
      certificates: { type: [CertificateSchema], required: true },
      mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10‑digit mobile number']
      },
      qualification: { type: String, required: true },
      subjects: { type: [String], required: true },
      experience: { type: String, required: true },
      skills: { type: String, required: true },
      about: { type: String, required: true }
    },
    { _id: false }
  )
);

// Student discriminator. Students may optionally have a mobile number when
// registering via Google. The interests array defaults to empty.
const StudentUser = BaseUser.discriminator(
  UserRole.Student,
  new Schema(
    {
      // Students require a first and last name when registering.
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      // The profile picture is optional for students.
      profilePic: { type: ProfilePicSchema, required: false },
      // Students may optionally have a mobile number when registering via Google.
      mobile: {
        type: String,
        required: function (this: any) {
          return !this.isGoogleUser;
        },
        trim: true,
        sparse: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10‑digit mobile number']
      },
      password: {
        type: String,
        required: function (this: any) {
          return !this.isGoogleUser;
        },
        minlength: 8
      }
    },
    { _id: false }
  )
);

// Owner discriminator. Owners are privileged users above admins. They
// currently share the same structure as admins but using a distinct
// discriminator allows custom behaviour and validation later on.
const OwnerUser = BaseUser.discriminator(
  UserRole.Owner,
  new Schema({}, { _id: false })
);

export {
  BaseUser as User,
  AdminUser as Admin,
  InstructorUser as Instructor,
  StudentUser as Student,
  OwnerUser as Owner
};