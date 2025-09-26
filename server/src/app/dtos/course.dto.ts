import { isNonEmptyString, isString, isNumber, isArrayOf, isOptional, validate, asBoolean } from './validate';

export type AddCourseDTO = {
  title: string;
  duration: number;
  categoryId: string;
  subcategoryId?: string;
  level: string;
  tags: string[];
  price: number;
  isPaid: boolean;
  about?: string;
  description?: string;
  syllabus: string[];
  requirements: string[];
  videoSource?: string;
  videoUrl?: string;
  introductionKey?: string;
};

export const parseAddCourseDTO = (payload: any) => validate<AddCourseDTO>({
  title: isNonEmptyString,
  duration: isNumber,
  categoryId: isNonEmptyString,
  subcategoryId: isOptional(isString),
  level: isNonEmptyString,
  tags: isArrayOf(isString),
  price: isNumber,
  isPaid: asBoolean,
  about: isOptional(isString),
  description: isOptional(isString),
  syllabus: isArrayOf(isString),
  requirements: isArrayOf(isString),
  videoSource: isOptional(isString),
  videoUrl: isOptional(isString),
  introductionKey: isOptional(isString),
}, payload);

export type EditCourseDTO = Partial<AddCourseDTO> & { introductionKey?: string };
export const parseEditCourseDTO = (payload: any) => validate<EditCourseDTO>({
  title: isOptional(isString),
  duration: isOptional(isNumber),
  categoryId: isOptional(isString),
  subcategoryId: isOptional(isString),
  level: isOptional(isString),
  tags: isOptional(isArrayOf(isString)),
  price: isOptional(isNumber),
  isPaid: isOptional(asBoolean),
  about: isOptional(isString),
  description: isOptional(isString),
  syllabus: isOptional(isArrayOf(isString)),
  requirements: isOptional(isArrayOf(isString)),
  videoSource: isOptional(isString),
  videoUrl: isOptional(isString),
  introductionKey: isOptional(isString),
}, payload);

export type ModerateCourseDTO = { action: 'approve'|'reject'; reason?: string };
export type SearchCourseDTO = { search?: string; filter?: string };
