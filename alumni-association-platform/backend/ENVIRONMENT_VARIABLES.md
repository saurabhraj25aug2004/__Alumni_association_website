# Environment Variables

This document lists all the required environment variables for the Alumni Association Platform.

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Database Configuration
```
MONGO_URI=your_mongodb_atlas_connection_string
```

### JWT Configuration
```
JWT_SECRET=your_jwt_secret_key_here
```

### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend URL for CORS and WebSockets
```
FRONTEND_URL=http://localhost:5173
```

## Example .env File

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni_association?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# CORS/WebSocket
FRONTEND_URL=http://localhost:5173
```

## How to Get Cloudinary Credentials

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy the following values:
   - **Cloud Name**: Found in the Dashboard overview
   - **API Key**: Found in the Dashboard under "API Environment variable"
   - **API Secret**: Found in the Dashboard under "API Environment variable"

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique values for JWT_SECRET
- Keep your Cloudinary API credentials secure
- Consider using different Cloudinary accounts for development and production

## Optional Environment Variables

```
NODE_ENV=development
PORT=5000
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
