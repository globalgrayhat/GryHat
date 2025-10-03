# Admin Setup Script

This directory contains utility scripts for the server application.

## Setup Default Admin

The `setup-default-admin.ts` script creates a default admin user for the application.

### Usage

```bash
# Using npm script (recommended)
npm run setup-admin

# Or run directly with ts-node
npx ts-node scripts/setup-default-admin.ts
```

### What it does

1. **Connects to the database** using the environment configuration
2. **Checks if admin exists** - looks for a user with email `admin@admin.com`
3. **Creates admin if not found** with the following credentials:
   - Email: `admin@admin.com`
   - Password: `123456`
   - Role: `admin`
   - First Name: `Default`
   - Last Name: `Admin`
   - Verified: `true`

### Environment Requirements

Make sure your `.env` file contains the necessary database configuration:

```env
DATABASE=mongodb://your-connection-string
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Security Note

⚠️ **IMPORTANT**: The default password `123456` should be changed immediately after first login for security reasons.

### Output

The script will provide clear feedback about:

- Database connection status
- Whether the admin already exists
- Success/failure of admin creation
- Admin user details (ID, email, role, creation date)

### Error Handling

The script includes proper error handling and will:

- Exit gracefully on database connection failures
- Show clear error messages for any issues
- Close database connections properly
