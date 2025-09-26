import { isNonEmptyString, isString, validate } from './validate';

export type ChangePasswordDTO = { currentPassword: string; newPassword: string };
export const parseChangePasswordDTO = (payload: any) => validate<ChangePasswordDTO>({
  currentPassword: isNonEmptyString,
  newPassword: isNonEmptyString
}, payload);

// Profile update is free-form (usecases handle allowed fields). Provide a minimal pass-through DTO.
export type UpdateProfileDTO = Record<string, any>;
export const parseUpdateProfileDTO = (payload: any) => ({ ok: true, data: payload, errors: {} });
