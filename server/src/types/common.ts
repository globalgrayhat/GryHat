import { UserRole } from '../constants/enums';

/**
 * The payload embedded in a JWT after successful authentication. The `role`
 * property uses the `UserRole` enum to guarantee a limited set of allowed
 * values. Should additional user roles be introduced, update the enum in
 * `src/constants/enums.ts` accordingly.
 */
export interface JwtPayload {
  Id: string;
  email: string;
  role: UserRole;
}

export interface UploadedFileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  path: string;
  size: number;
  filename: string;
}
