import { Schema, model, Types, Document } from 'mongoose';
import { FileRef } from '@src/types/courseInterface';

interface MediaDoc extends FileRef {}
interface LessonDoc extends Document {
  title: string;
  description: string;
  contents: string[];
  duration: number;
  about?: string;
  instructorId: Types.ObjectId;
  courseId: Types.ObjectId;
  isPreview: boolean;
  resources: MediaDoc[];
  videoTusKeys: string[];
  primaryVideoKey?: string;
  media: MediaDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const FileSubSchema = new Schema<FileRef>(
  { name: { type: String, required: true }, url: { type: String, required: true }, key: { type: String } },
  { _id: false }
);

const LessonSchema = new Schema<LessonDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    contents: { type: [String], required: true, default: [] },
    duration: { type: Number, required: true, min: 0 },
    about: { type: String },
    instructorId: { type: Schema.Types.ObjectId, ref: 'instructor', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'course', required: true },
    isPreview: { type: Boolean, default: false, index: true },
    resources: { type: [FileSubSchema], default: [] },
    videoTusKeys: { type: [String], default: [] },
    primaryVideoKey: { type: String },
    media: { type: [FileSubSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'lessons' }
);

LessonSchema.index({ courseId: 1, isPreview: 1 });

const Lessons = model<LessonDoc>('Lesson', LessonSchema, 'lessons');
export default Lessons;
