import { CourseDbRepositoryInterface } from '../../../app/repositories/courseDbRepository';
import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';

export const searchCourseU = async (
  searchQuery: string,
  filterQuery: string,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  if (!searchQuery && !filterQuery) {
    throw new AppError(
      'Please provide a search or filter query',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  let isFree = false;
  let searchParams: string;

  if (searchQuery) {
    const freeRegex = /^free\s/i;
    const isFreeMatch = searchQuery.match(freeRegex);
    if (isFreeMatch) {
      isFree = true;
      searchParams = searchQuery.replace(freeRegex, '').trim();
    } else {
      searchParams = searchQuery;
    }
  } else {
    searchParams = filterQuery;
  }

  const searchResult = await courseDbRepository.searchCourse(
    isFree,
    searchParams,
    filterQuery
  );

  return searchResult;
};
