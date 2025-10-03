#!/usr/bin/env ts-node

/**
 * Script to create a default admin user
 * Usage: npm run setup-admin or ts-node scripts/setup-default-admin.ts
 *
 * This script will:
 * 1. Connect to the database
 * 2. Check if admin@admin.com already exists
 * 3. If not, create a new admin user with email: admin@admin.com and password: 123456
 * 4. If exists, log that the admin already exists
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import required modules
import configKeys from '../src/config';
import { Admin } from '../src/frameworks/database/mongodb/models/user';
import { authService } from '../src/frameworks/services/authService';
import { UserRole } from '../src/constants/enums';

const DEFAULT_ADMIN_EMAIL = 'admin@admin.com';
const DEFAULT_ADMIN_PASSWORD = '123456';

async function connectToDatabase() {
  try {
    await mongoose.connect(configKeys.DB_CLUSTER_URL, {
      dbName: configKeys.DB_NAME
    });
    console.log('✅ Database connected successfully');
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function setupDefaultAdmin() {
  try {
    console.log('🔍 Checking for existing admin user...');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(
        `✅ Admin user with email ${DEFAULT_ADMIN_EMAIL} already exists`
      );
      console.log(`   User ID: ${existingAdmin._id}`);
      console.log(`   Role: ${(existingAdmin as any).role}`);
      console.log(`   Created: ${(existingAdmin as any).dateJoined}`);
      return;
    }

    console.log('👤 Creating new default admin user...');

    // Hash the password
    const auth = authService();
    const hashedPassword = await auth.hashPassword(DEFAULT_ADMIN_PASSWORD);

    // Create new admin user
    const newAdmin = new Admin({
      role: UserRole.Admin,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      firstName: 'Default',
      lastName: 'Admin',
      isVerified: true,
      isGoogleUser: false,
      isBlocked: false,
      dateJoined: new Date()
    });

    // Save to database
    const savedAdmin = await newAdmin.save();

    console.log('✅ Default admin user created successfully!');
    console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   User ID: ${savedAdmin._id}`);
    console.log(`   Role: ${(savedAdmin as any).role}`);
    console.log('');
    console.log(
      '⚠️  IMPORTANT: Please change the default password after first login!'
    );
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting default admin setup...');
    console.log('');

    await connectToDatabase();
    await setupDefaultAdmin();

    console.log('');
    console.log('🎉 Admin setup completed successfully!');
  } catch (error: any) {
    console.error('💥 Admin setup failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { setupDefaultAdmin };
