# Database Seeding Setup

## Overview

This document explains how to set up and run the database seeding script for the Alumni Association Platform.

## Prerequisites

1. **MongoDB Atlas Account**: You need a MongoDB Atlas account with a cluster set up
2. **Node.js**: Make sure Node.js is installed on your system
3. **Environment Variables**: Set up your `.env` file with the required variables

## Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni_association?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Getting MongoDB Atlas URI

1. **Sign up/Login**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create an account or login
2. **Create Cluster**: Create a new cluster (free tier is sufficient for development)
3. **Database Access**: Create a database user with read/write permissions
4. **Network Access**: Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)
5. **Get Connection String**: 
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your actual values

### Example MongoDB Atlas URI:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/alumni_association?retryWrites=true&w=majority
```

## Running the Seed Script

### Option 1: Using npm script (Recommended)
```bash
npm run seed
```

### Option 2: Direct execution
```bash
node seed.js
```

## What the Seed Script Creates

The seed script will populate your database with the following data:

### Users (17 total)
- **2 Admins**: Platform administrators
- **5 Alumni**: Graduated students with professional experience
- **10 Students**: Current students

### Jobs (10 total)
- Various job postings from top companies (Google, Microsoft, Netflix, etc.)
- Different roles: Software Engineer, Product Manager, Data Scientist, etc.
- Realistic job descriptions, requirements, and salary ranges

### Workshops (5 total)
- Educational workshops on various topics
- Different formats: online, in-person, hybrid
- Realistic workshop details and materials

### Blogs (5 total)
- Professional blog posts written by alumni
- Topics: career advice, technology trends, entrepreneurship
- Realistic content with views, likes, and comments

### Feedback (10 total)
- User feedback on various platform features
- Different ratings and constructive comments
- Mix of anonymous and public feedback

### Additional Data
- **Job Applications**: Students applying to jobs with different statuses
- **Workshop Registrations**: Students registering for workshops
- **Blog Interactions**: Likes and comments on blog posts

## Default Login Credentials

After running the seed script, you can use these credentials to test the platform:

### Admin Users
- **Email**: `admin@alumni.com`
- **Password**: `admin123456`

- **Email**: `sarah.johnson@alumni.com`
- **Password**: `admin123456`

### Alumni Users
- **Email**: `michael.chen@alumni.com`
- **Password**: `password123`

- **Email**: `emily.rodriguez@alumni.com`
- **Password**: `password123`

- **Email**: `david.kim@alumni.com`
- **Password**: `password123`

- **Email**: `lisa.thompson@alumni.com`
- **Password**: `password123`

- **Email**: `james.wilson@alumni.com`
- **Password**: `password123`

### Student Users
- **Email**: `alex.martinez@student.com`
- **Password**: `password123`

- **Email**: `sophia.lee@student.com`
- **Password**: `password123`

- **Email**: `ryan.park@student.com`
- **Password**: `password123`

- **Email**: `maya.patel@student.com`
- **Password**: `password123`

- **Email**: `kevin.oconnor@student.com`
- **Password**: `password123`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB Atlas URI
   - Verify your IP is whitelisted
   - Ensure your database user has proper permissions

2. **Environment Variables Not Found**
   - Make sure `.env` file exists in the `backend/` directory
   - Check that all required variables are set
   - Restart your terminal after creating the `.env` file

3. **Permission Errors**
   - Ensure your database user has read/write permissions
   - Check that your cluster is active and accessible

4. **Network Issues**
   - Verify your internet connection
   - Check if your firewall is blocking the connection
   - Try using a different network if possible

### Error Messages

- **"MongoDB connection error"**: Check your MONGO_URI and network connection
- **"Validation failed"**: Check the data format in the seed script
- **"Permission denied"**: Verify database user permissions
- **"Timeout"**: Check network connection and try again

## Resetting the Database

To clear all data and start fresh:

1. **Delete all documents**:
   ```bash
   # Connect to your MongoDB Atlas cluster
   # Delete all collections manually, or
   # Run the seed script again (it clears data first)
   ```

2. **Re-run the seed script**:
   ```bash
   npm run seed
   ```

## Next Steps

After successfully running the seed script:

1. **Start the server**: `npm run dev`
2. **Test the API**: Use the login credentials to test different user roles
3. **Explore the data**: Check the MongoDB Atlas dashboard to see the created data
4. **Frontend integration**: Connect your React frontend to test the full application

## Support

If you encounter any issues:

1. Check the console output for specific error messages
2. Verify your environment variables are correctly set
3. Ensure your MongoDB Atlas cluster is properly configured
4. Check the troubleshooting section above
5. Review the MongoDB Atlas documentation for connection issues
