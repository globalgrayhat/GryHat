/**
 * This file re‑exports the Student discriminator from the unified
 * user model. All student documents now live in the shared `users`
 * collection managed by the `user.ts` module. Retaining this
 * entry‑point makes it trivial for existing code to import the
 * Student model without referencing internal details of the new
 * storage strategy.
 */

import { Student } from './user';

export default Student;