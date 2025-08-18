# Alumni Association Platform - API Documentation

## Authentication Endpoints

### Base URL: `http://localhost:5000/api`

---

## 1. User Registration
**POST** `/auth/register`

Register a new user (students & alumni only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "alumni",
  "graduationYear": 2020,
  "major": "Computer Science"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Waiting for admin approval.",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "isApproved": false
  }
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Required, must be "alumni" or "student"
- `graduationYear`: Required for alumni/student, valid year
- `major`: Required for alumni/student, string

---

## 2. User Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "isApproved": true,
    "profileImage": "image_url"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `401`: Account pending approval

---

## 3. Get Current User
**GET** `/auth/me`

Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "alumni",
  "isApproved": true,
  "profileImage": {
    "url": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg",
    "public_id": "folder/image"
  },
  "graduationYear": 2020,
  "major": "Computer Science",
  "bio": "Software engineer with 3 years of experience",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "github": "https://github.com/johndoe",
    "website": "https://johndoe.com"
  }
}
```

---

## 4. Update User Profile
**PUT** `/auth/update-profile`

Update user profile information and upload profile image (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: "John Doe"
email: "john@example.com"
graduationYear: 2020
major: "Computer Science"
bio: "Software engineer with 3 years of experience"
phone: "+1234567890"
location: "San Francisco, CA"
socialLinks[linkedin]: "https://linkedin.com/in/johndoe"
socialLinks[twitter]: "https://twitter.com/johndoe"
socialLinks[github]: "https://github.com/johndoe"
socialLinks[website]: "https://johndoe.com"
image: [file upload]
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "profileImage": {
      "url": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/alumni-association/profile.jpg",
      "public_id": "alumni-association/profile"
    },
    "graduationYear": 2020,
    "major": "Computer Science",
    "bio": "Software engineer with 3 years of experience",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.com"
    }
  }
}
```

**Notes:**
- Image file must be JPG, JPEG, PNG, GIF, or WEBP
- Maximum file size: 5MB
- Image will be automatically optimized and stored in Cloudinary
- Old profile image will be deleted from Cloudinary when updated

---

## 5. Delete Profile Image
**DELETE** `/auth/delete-profile-image`

Delete user's profile image (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "message": "Profile image deleted successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "profileImage": null
  }
}
```

---
  "email": "john@example.com",
  "role": "alumni",
  "isApproved": true,
  "profileImage": "image_url",
  "graduationYear": 2020,
  "major": "Computer Science",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 4. Get Pending Users (Admin Only)
**GET** `/auth/pending-users`

Get list of users waiting for approval (admin only).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
[
  {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "isApproved": false,
    "graduationYear": 2020,
    "major": "Computer Science",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 5. Approve/Reject User (Admin Only)
**PUT** `/auth/approve-user/:id`

Approve or reject a user (admin only).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "isApproved": true
}
```

**Response (200):**
```json
{
  "message": "User approved successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "isApproved": true
  }
}
```

---

## Authentication Middleware

### Protected Routes
Use the `protect` middleware to require authentication:
```javascript
const { protect } = require('../middlewares/auth');
router.get('/protected-route', protect, controllerFunction);
```

### Role-Based Authorization
Use role-based middleware for specific access:

```javascript
const { adminOnly, alumniAndAdmin, studentAndAdmin } = require('../middlewares/auth');

// Admin only
router.get('/admin-only', protect, adminOnly, controllerFunction);

// Alumni and Admin
router.get('/alumni-admin', protect, alumniAndAdmin, controllerFunction);

// Student and Admin
router.get('/student-admin', protect, studentAndAdmin, controllerFunction);

// Custom roles
const { authorize } = require('../middlewares/auth');
router.get('/custom', protect, authorize('alumni', 'student'), controllerFunction);
```

---

## Error Responses

### Common Error Codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token, not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format:
```json
{
  "message": "Error description"
}
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni_association
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

---

## Initial Setup

1. **Create Admin User:**
   ```bash
   node utils/createAdmin.js
   ```

2. **Default Admin Credentials:**
   - Email: `admin@alumni.com`
   - Password: `admin123456`

3. **Start Server:**
   ```bash
   npm run dev
   ```

---

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "alumni",
    "graduationYear": 2020,
    "major": "Computer Science"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get current user (with token):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update profile with image upload:
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "bio=Software engineer" \
  -F "image=@/path/to/image.jpg"
```

### Create blog with image:
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=My Blog Post" \
  -F "content=Blog content here" \
  -F "category=career" \
  -F "image=@/path/to/blog-image.jpg"
```

---

## Image Upload Features

### Cloudinary Integration
- **Automatic Optimization**: Images are optimized for web delivery
- **Secure Storage**: Images stored in Cloudinary cloud
- **CDN Delivery**: Fast global content delivery
- **Automatic Format Conversion**: WebP format for modern browsers
- **Responsive Images**: Automatic resizing and cropping

### Supported Features
- Profile image upload/update/delete
- Blog post image upload/update/delete
- Automatic cleanup of old images
- File size validation (5MB limit)
- Format validation (JPG, JPEG, PNG, GIF, WEBP)
- Error handling for upload failures
