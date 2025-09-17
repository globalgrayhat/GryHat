<<<<<<< HEAD
/**
 * This file re‑exports the Instructor discriminator from the unified
 * user model. In GrayHat v2.0.0 all user roles are consolidated in a
 * single collection defined in `user.ts`. Modules that previously
 * imported the instructor model directly can continue to do so without
 * modification. Any instructor‑specific fields or validation rules are
 * defined on the discriminator itself within `user.ts`.
 */

import { Instructor } from './user';

export default Instructor;
=======
import { Schema, model } from 'mongoose';

import { Certificate } from '../../../../types/instructorInterface';

interface ProfilePic {
  name?: string;
  url?: string;
}

const ProfileSchema = new Schema<ProfilePic>({
  name: {
    type: String
  },
  url: {
    type: String
  }
});

const instructorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  profilePic: {
    type: ProfileSchema,
    required: true
  },
  certificates: {
    type: Array<Certificate>,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  qualification: {
    type: String,
    required: true
  },
  subjects: {
    type: Array<string>,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  coursesCreated: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  rejected: { type: Boolean, default: false },
  rejectedReason: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String, default: '' },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  profileUrl: {
    type: String,
    default: ''
  }
});

const Instructor = model('Instructors', instructorSchema, 'instructor');

export default Instructor;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
