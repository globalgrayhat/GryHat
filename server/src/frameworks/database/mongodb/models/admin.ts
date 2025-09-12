/**
 * This file re‑exports the Admin discriminator from the unified user model.
 * Previously the admin model contained its own schema; however, in
 * GrayHat v2.0.0 all user roles are stored in a single collection
 * through the `user.ts` module. Importing and re‑exporting here
 * preserves backwards compatibility for modules that reference
 * `models/admin` directly without needing to know about the new
 * unified storage strategy.
 */

import { Admin } from './user';

export default Admin;