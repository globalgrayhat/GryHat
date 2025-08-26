import { Schema, model } from 'mongoose';
import { AddCourseInfoInterface } from '@src/types/courseInterface';

const FileSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
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
export default Course;
