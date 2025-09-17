<<<<<<< HEAD
import { Schema, model, Types, Document } from 'mongoose';
import { FileRef, VideoSource, CourseStatus } from '@src/types/courseInterface';

export interface CourseDoc extends Document {
  title: string;
  instructorId: Types.ObjectId;
  duration: number;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  level: string;
  tags: string[];
  price: number;
  isPaid: boolean;
  about: string;
  description: string;
  syllabus: string[];
  requirements: string[];
  thumbnail?: FileRef;
  guidelines?: FileRef;
  introduction?: FileRef;
  videoSource: VideoSource;
  videoUrl?: string;
  resources: FileRef[];
  coursesEnrolled: Types.ObjectId[];
  rating: number;
  isVerified: boolean;
  completionStatus: number;
  status: CourseStatus;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const FileSubSchema = new Schema<FileRef>(
  { name: { type: String, required: true }, url: { type: String, required: true }, key: { type: String } },
  { _id: false }
);

const courseSchema = new Schema<CourseDoc>(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 100 },
    instructorId: { type: Schema.Types.ObjectId, ref: 'instructor', required: true },
    duration: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'categories', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'categories' },
    level: { type: String, required: true },
    tags: { type: [String], default: [] },
    price: { type: Number, min: 0, default: 0 },
    isPaid: { type: Boolean, required: true },
    about: { type: String, required: true },
    description: { type: String, required: true, minlength: 10 },
    syllabus: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    thumbnail: { type: FileSubSchema },
    guidelines: { type: FileSubSchema },
    introduction: { type: FileSubSchema },
    videoSource: { type: String, enum: ['youtube', 'vimeo', 'local', 's3'], default: 'local' },
    videoUrl: { type: String },
    resources: { type: [FileSubSchema], default: [] },
    coursesEnrolled: [{ type: Schema.Types.ObjectId, ref: 'students' }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    isVerified: { type: Boolean, default: false },
    completionStatus: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
    rejectionReason: { type: String, default: null }
  },
  { collection: 'course', timestamps: true }
);

const Course = model<CourseDoc>('Course', courseSchema);
=======
import { Schema, model } from 'mongoose';
import { AddCourseInfoInterface } from '@src/types/courseInterface';

const FileSchema = new Schema({
  url: {
    type: String
  }
});
const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  level: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  price: {
    type: Number,
    required: function (this: AddCourseInfoInterface) {
      return this.isPaid;
    },
    min: 0
  },
  isPaid: {
    type: Boolean,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  syllabus: {
    type: [String],
    required: true
  },
  requirements: {
    type: [String]
  },
  thumbnail: {
    type: FileSchema,
    required: true
  },
  guidelines: {
    type: FileSchema,
    required: true
  },
  introduction: {
    type: FileSchema,
    required: true
  },
  coursesEnrolled: [
    {
      type: Schema.Types.ObjectId,
      ref: 'students'
    }
  ],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completionStatus: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

const Course = model('Course', courseSchema, 'course');
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export default Course;
