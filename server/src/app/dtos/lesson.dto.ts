import { isNonEmptyString, isString, isNumber, isArrayOf, isOptional, validate, asBoolean } from './validate';

export type AddLessonDTO = {
  title: string;
  description?: string;
  contents: string[];
  duration: number;
  about?: string;
  isPreview: boolean;
  videoSource?: string;
  videoUrl?: string;
  videoFile?: string;
  videoTusKeys?: string[];
  primaryVideoKey?: string; 
  questions?: any[];
  resources?: Array<{ name: string; url: string; key?: string }>;
};

export const parseAddLessonDTO = (payload: any) =>
  validate<AddLessonDTO>({
    title: isNonEmptyString,
    description: isOptional(isString),
    contents: isArrayOf(isString),
    duration: isNumber,
    about: isOptional(isString),
    isPreview: asBoolean,
    videoSource: isOptional(isString),
    videoUrl: isOptional(isString),
    videoFile: isOptional(isString),
    videoTusKeys: isOptional(isArrayOf(isString)),
    primaryVideoKey: isOptional(isString), 
    questions: isOptional((v) => ({ ok: true, val: Array.isArray(v) ? v : [] } as any)),
    resources: isOptional((v) => ({ ok: Array.isArray(v), val: Array.isArray(v) ? v : [] } as any)),
  }, payload);

export type EditLessonDTO = Partial<AddLessonDTO>;
export const parseEditLessonDTO = (payload: any) =>
  validate<EditLessonDTO>({
    title: isOptional(isString),
    description: isOptional(isString),
    contents: isOptional(isArrayOf(isString)),
    duration: isOptional(isNumber),
    about: isOptional(isString),
    isPreview: isOptional(asBoolean),
    videoSource: isOptional(isString),
    videoUrl: isOptional(isString),
    videoFile: isOptional(isString),
    videoTusKeys: isOptional(isArrayOf(isString)),
    primaryVideoKey: isOptional(isString),
    questions: isOptional((v) => ({ ok: true, val: Array.isArray(v) ? v : [] } as any)),
    resources: isOptional((v) => ({ ok: Array.isArray(v), val: Array.isArray(v) ? v : [] } as any)),
  }, payload);
