<<<<<<< HEAD
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
=======
import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },

  password: {
    type: String,
    required: true,
    minlength: 4
  }
});

const Admin = model('Admin', adminSchema, 'admin');

export default Admin;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
