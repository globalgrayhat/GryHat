import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';
import { QuizDbInterface } from '../../repositories/quizDbRepository';

/**
 * Delete a lesson and its associated quizzes
 * @param lessonId - The ID of the lesson to delete
 * @param lessonDbRepository - Lesson database repository
 * @param quizDbRepository - Quiz database repository
 */
export const deleteLessonU = async (
  lessonId: string,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
): Promise<void> => {
  try {
    // Delete associated quizzes first
    await quizDbRepository.deleteQuizzesByLessonId(lessonId);

    // Delete the lesson
    await lessonDbRepository.deleteLesson(lessonId);
  } catch (error) {
    throw new Error(
      `Failed to delete lesson: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
