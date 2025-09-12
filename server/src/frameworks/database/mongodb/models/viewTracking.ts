import { Schema, model, Document } from 'mongoose';

export interface ViewTracking extends Document {
  userId: string;
  courseId: string;
  lessonId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
}

const viewTrackingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
});

export const ViewTrackingModel = model<ViewTracking>('ViewTracking', viewTrackingSchema);