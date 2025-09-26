import mongoose from 'mongoose';
import Lessons from '../models/lessons';
import {
  CreateLessonInterface,
  EditLessonInterface
} from '../../../../types/lesson';

export const lessonRepositoryMongodb = () => {
  const addLesson = async (
    courseId: string,
    instructorId: string,
    lesson: CreateLessonInterface
  ) => {
    // ensure required linkage
    lesson.courseId = courseId;
    lesson.instructorId = instructorId;

    (lesson as any).media = Array.isArray(lesson.media) ? lesson.media : [];
    (lesson as any).resources = Array.isArray((lesson as any).resources) ? (lesson as any).resources : [];
    (lesson as any).videoTusKeys = Array.isArray((lesson as any).videoTusKeys) ? (lesson as any).videoTusKeys : [];
    if (typeof (lesson as any).isPreview !== 'boolean') (lesson as any).isPreview = false;

    const newLesson = new Lessons(lesson as any);
    const { _id } = await newLesson.save();
    return _id;
  };

  const editLesson = async (lessonId: string, lesson: EditLessonInterface) => {
    // always bump updatedAt
    const doc = await Lessons.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(lessonId) },
      { ...lesson, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return doc;
  };

  const getLessonsByCourseId = async (courseId: string) => {
    const lessons = await Lessons.find({
      courseId: new mongoose.Types.ObjectId(courseId)
    }).lean();
    return lessons;
  };

  const getLessonById = async (lessonId: string) => {
    const lesson = await Lessons.findOne({
      _id: new mongoose.Types.ObjectId(lessonId)
    }).lean();
    return lesson;
  };

  return {
    addLesson,
    editLesson,
    getLessonsByCourseId,
    getLessonById
  };
};

export type LessonRepositoryMongoDbInterface = typeof lessonRepositoryMongodb;
