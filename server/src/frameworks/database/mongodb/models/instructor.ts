/**
 * This file re‑exports the Instructor discriminator from the unified
 * user model. In GrayHat v2.0.0 all user roles are consolidated in a
 * single collection defined in `user.ts`. Modules that previously
 * imported the instructor model directly can continue to do so without
 * modification. Any instructor‑specific fields or validation rules are
 * defined on the discriminator itself within `user.ts`.
 */

import { Instructor } from './user';

export default Instructor;