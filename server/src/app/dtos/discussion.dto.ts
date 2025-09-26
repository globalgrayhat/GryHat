import { isNonEmptyString, isString, validate } from './validate';

export type AddDiscussionDTO = { message: string };
export const parseAddDiscussionDTO = (payload: any) => validate<AddDiscussionDTO>({
  message: isNonEmptyString
}, payload);

export type EditDiscussionDTO = { message: string };
export const parseEditDiscussionDTO = (payload: any) => validate<EditDiscussionDTO>({
  message: isNonEmptyString
}, payload);

export type ReplyDTO = { reply: string };
export const parseReplyDTO = (payload: any) => validate<ReplyDTO>({
  reply: isNonEmptyString
}, payload);
