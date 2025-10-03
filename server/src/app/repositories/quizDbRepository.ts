import { QuizRepositoryMongoDbInterface } from '@src/frameworks/database/mongodb/repositories/quizzDbRepository';
import {
  AddQuizInfoInterface,
  EditQuizInfoInterface
} from '@src/types/courseInterface';

export const quizDbRepository = (
  repository: ReturnType<QuizRepositoryMongoDbInterface>
) => {
  const addQuiz = async (quiz: AddQuizInfoInterface) =>
    await repository.addQuiz(quiz);

  const editQuiz = async (lessonId: string, quiz: EditQuizInfoInterface) =>
    repository.editQuiz(lessonId, quiz);

  const getQuizByLessonId = async (lessonId: string) =>
    await repository.getQuizByLessonId(lessonId);

  const deleteQuizzesByLessonId = async (lessonId: string) =>
    await repository.deleteQuizzesByLessonId(lessonId);

  return {
    addQuiz,
    editQuiz,
    deleteQuizzesByLessonId,
    getQuizByLessonId
  };
};

export type QuizDbInterface = typeof quizDbRepository;
