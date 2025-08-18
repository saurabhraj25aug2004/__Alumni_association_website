# Cloudinary Integration - Alumni Association Platform

## Overview

The Alumni Association Platform now includes full Cloudinary integration for image uploads, storage, and optimization. This implementation provides secure, scalable, and optimized image handling for user profiles and blog posts.

## Features Implemented

### ✅ 1. Cloudinary Configuration
- **File**: `config/cloudinary.js`
- **Purpose**: Configure Cloudinary SDK with environment variables
- **Environment Variables**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### ✅ 2. Upload Middleware
- **File**: `middlewares/upload.js`
- **Features**:
  - Multer + CloudinaryStorage integration
  - File size limit: 5MB
  - Supported formats: JPG, JPEG, PNG, GIF, WEBP
  - Automatic image optimization
  - Error handling for upload failures
  - Folder organization: `alumni-association/`

### ✅ 3. User Profile Image Management
- **Updated Files**:
  - `models/User.js` - Added profile image structure with Cloudinary URLs
  - `controllers/authController.js` - Added `updateProfile` and `deleteProfileImage` functions
  - `routes/authRoutes.js` - Added image upload routes

**New Endpoints**:
- `PUT /api/auth/update-profile` - Update profile with image upload
- `DELETE /api/auth/delete-profile-image` - Delete profile image

### ✅ 4. Blog Image Management
- **Updated Files**:
  - `models/Blog.js` - Updated image structure for Cloudinary URLs
  - `controllers/blogController.js` - Added image handling in CRUD operations
  - `routes/blogRoutes.js` - Added upload middleware to blog routes

**Enhanced Endpoints**:
- `POST /api/blogs` - Create blog with image upload
- `PUT /api/blogs/:id` - Update blog with image upload
- `DELETE /api/blogs/:id` - Delete blog and associated image

### ✅ 5. Automatic Image Cleanup
- Old images are automatically deleted from Cloudinary when:
  - User updates their profile image
  - Blog post image is updated
  - Blog post is deleted
  - Profile image is deleted

### ✅ 6. Error Handling
- File size validation
- File type validation
- Upload error handling
- Cloudinary API error handling
- Graceful fallbacks for failed operations

## File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middlewares/
│   └── upload.js              # Upload middleware with Cloudinary
├── models/
│   ├── User.js               # Updated with Cloudinary image structure
│   └── Blog.js               # Updated with Cloudinary image structure
├── controllers/
│   ├── authController.js     # Added profile image management
│   └── blogController.js     # Added blog image management
├── routes/
│   ├── authRoutes.js         # Added image upload routes
│   └── blogRoutes.js         # Added upload middleware
├── utils/
│   └── testCloudinary.js     # Cloudinary configuration test
└── ENVIRONMENT_VARIABLES.md  # Environment variables documentation
```

## Environment Variables Required

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage Examples

### Frontend Image Upload (React)

```javascript
// Profile image upload
const updateProfile = async (formData) => {
  try {
    const response = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Include image file
    });
    const data = await response.json();
    console.log('Profile updated:', data.user.profileImage.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Blog image upload
const createBlog = async (formData) => {
  try {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Include image file
    });
    const data = await response.json();
    console.log('Blog created:', data.blog.imageUrl.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Backend Testing

```bash
# Test Cloudinary configuration
npm run test:cloudinary

# Test models
npm run test:models

# Create admin user
npm run create:admin
```

## Image Response Format

All image uploads return the following structure:

```json
{
  "imageUrl": {
    "url": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/alumni-association/image.jpg",
    "public_id": "alumni-association/image"
  }
}
```

## Security Features

- **File Validation**: Only image files allowed
- **Size Limits**: 5MB maximum file size
- **Format Restrictions**: JPG, JPEG, PNG, GIF, WEBP only
- **Automatic Cleanup**: Old images deleted when replaced
- **Secure Storage**: Images stored in Cloudinary cloud
- **CDN Delivery**: Fast global content delivery

## Performance Optimizations

- **Automatic Compression**: Images optimized for web
- **Format Conversion**: WebP for modern browsers
- **Responsive Images**: Automatic resizing
- **Lazy Loading**: Ready for frontend implementation
- **CDN Caching**: Global content delivery network

## Error Handling

The system handles various error scenarios:

- **File Too Large**: Returns 400 with size limit message
- **Invalid File Type**: Returns 400 with format restriction message
- **Upload Failure**: Returns 500 with error details
- **Cloudinary API Errors**: Graceful fallback with logging
- **Missing Environment Variables**: Clear error messages

## Testing

### Test Cloudinary Configuration
```bash
npm run test:cloudinary
```

This will:
- Check environment variables
- Test Cloudinary connection
- Verify upload configuration
- Display folder structure info

### Manual Testing with cURL

```bash
# Update profile with image
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John Doe" \
  -F "image=@/path/to/image.jpg"

# Create blog with image
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Blog" \
  -F "content=Blog content" \
  -F "category=career" \
  -F "image=@/path/to/image.jpg"
```

## Next Steps

1. **Frontend Integration**: Implement image upload components in React
2. **Image Gallery**: Add support for multiple images per blog
3. **Image Cropping**: Add client-side image cropping before upload
4. **Progressive Loading**: Implement progressive image loading
5. **Image Analytics**: Track image usage and performance

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check `.env` file exists
   - Verify all Cloudinary variables are set
   - Restart server after adding variables

2. **Upload Failures**
   - Check file size (max 5MB)
   - Verify file format (JPG, JPEG, PNG, GIF, WEBP)
   - Check Cloudinary account status
   - Verify internet connection

3. **Image Not Displaying**
   - Check Cloudinary URL format
   - Verify image exists in Cloudinary dashboard
   - Check CORS settings if loading from frontend

### Support

For Cloudinary-specific issues:
- Check [Cloudinary Documentation](https://cloudinary.com/documentation)
- Verify account status and quotas
- Check API key permissions

For application issues:
- Check server logs for error messages
- Verify database connections
- Test with smaller image files first
