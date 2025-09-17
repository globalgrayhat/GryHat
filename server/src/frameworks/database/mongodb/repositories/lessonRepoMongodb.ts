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
<<<<<<< HEAD
    // ensure required linkage
    lesson.courseId = courseId;
    lesson.instructorId = instructorId;

    (lesson as any).media = Array.isArray(lesson.media) ? lesson.media : [];
    (lesson as any).resources = Array.isArray((lesson as any).resources) ? (lesson as any).resources : [];
    (lesson as any).videoTusKeys = Array.isArray((lesson as any).videoTusKeys) ? (lesson as any).videoTusKeys : [];
    if (typeof (lesson as any).isPreview !== 'boolean') (lesson as any).isPreview = false;

    const newLesson = new Lessons(lesson as any);
=======
    lesson.courseId = courseId;
    lesson.instructorId = instructorId;
    const newLesson = new Lessons(lesson);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    const { _id } = await newLesson.save();
    return _id;
  };

  const editLesson = async (lessonId: string, lesson: EditLessonInterface) => {
<<<<<<< HEAD
    // always bump updatedAt
    const doc = await Lessons.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(lessonId) },
      { ...lesson, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return doc;
=======
    const response = await Lessons.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(lessonId) },
      { ...lesson }
    );
    return response;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  };

  const getLessonsByCourseId = async (courseId: string) => {
    const lessons = await Lessons.find({
      courseId: new mongoose.Types.ObjectId(courseId)
<<<<<<< HEAD
    }).lean();
=======
    });
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return lessons;
  };

  const getLessonById = async (lessonId: string) => {
    const lesson = await Lessons.findOne({
      _id: new mongoose.Types.ObjectId(lessonId)
<<<<<<< HEAD
    }).lean();
=======
    });
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
