// src/types/express.d.ts
//
// This module augmentation adds a `user` property to the Express
// `Request` interface. Without this, TypeScript assumes that
// `req.user` does not exist on `Request`, leading to errors wherever
// authentication middleware attaches a user object. The `UserRole`
// enum is imported to type the `role` property consistently across
// the application.

import { UserRole } from '../constants/enums';

declare global {
  namespace Express {
    interface Request {
      /**
       * A custom `user` property added by authentication middleware. It
       * contains identifying information extracted from a validated JWT.
       * When a request is unauthenticated, this property will be
       * undefined. The Id is always stored as a string (not ObjectId) to
       * align with the project's JWT payload definitions.
       */
      user?: {
        Id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};