import { Request } from 'express';
import { UserRole } from '../constants/enums';

/**
 * An extension of Express's Request object that includes an optional `user` property.
 * The `user` is attached by the authentication middleware and contains details
 * extracted from a verified JWT. Using the `UserRole` enum here enforces
 * consistent role values throughout the system.
 */
export interface CustomRequest extends Request {
  user?: {
    Id: string;
    email: string;
    role: UserRole;
  };
}