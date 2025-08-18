# Alumni Association Platform - API Routes Documentation

## Overview

This document describes all the API endpoints available in the Alumni Association Platform backend.

**Base URL**: `http://localhost:5000/api`

---

## Authentication Endpoints

### POST `/auth/register`
Register a new user (students & alumni only)
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student",
    "graduationYear": 2024,
    "major": "Computer Science"
  }
  ```

### POST `/auth/login`
Login user
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### GET `/auth/me`
Get current user profile
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### GET `/auth/pending-users`
Get pending user approvals (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`

### PUT `/auth/approve-user/:id`
Approve/reject user (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "isApproved": true,
    "reason": "Approved after review"
  }
  ```

---

## Admin Endpoints

### GET `/admin/users`
Get all users with pagination and filters
- **Access**: Private (Admin)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `role`: Filter by role (admin/alumni/student)
  - `isApproved`: Filter by approval status
  - `search`: Search by name or email

### GET `/admin/users/:id`
Get user details with activities
- **Access**: Private (Admin)

### PUT `/admin/users/:id/approve`
Approve/reject user
- **Access**: Private (Admin)
- **Body**:
  ```json
  {
    "isApproved": true,
    "reason": "Approved after review"
  }
  ```

### DELETE `/admin/users/:id`
Delete user
- **Access**: Private (Admin)

### GET `/admin/analytics`
Get analytics dashboard data
- **Access**: Private (Admin)
- **Response**:
  ```json
  {
    "userStats": {
      "total": 150,
      "alumni": 80,
      "students": 60,
      "pendingApprovals": 10
    },
    "contentStats": {
      "jobs": 25,
      "workshops": 15,
      "blogs": 30,
      "feedback": 45
    },
    "recentActivity": {
      "users": [...],
      "jobs": [...],
      "workshops": [...]
    },
    "feedbackStats": [...],
    "monthlyRegistrations": [...]
  }
  ```

---

## Job Endpoints

### GET `/jobs`
Get all active jobs with filters
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search in title, description, company
  - `type`: Filter by job type (full-time/part-time/internship/contract)
  - `location`: Filter by location
  - `company`: Filter by company name

### GET `/jobs/:id`
Get job by ID with applicants
- **Access**: Public

### POST `/jobs`
Create a new job
- **Access**: Private (Alumni only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Software Engineer",
    "description": "We are looking for a skilled software engineer...",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "type": "full-time",
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "requirements": ["3+ years experience", "JavaScript", "React"],
    "skills": ["JavaScript", "React", "Node.js"],
    "deadline": "2024-12-31"
  }
  ```

### PUT `/jobs/:id`
Update job
- **Access**: Private (Job poster only)
- **Headers**: `Authorization: Bearer <token>`

### DELETE `/jobs/:id`
Delete job
- **Access**: Private (Job poster only)
- **Headers**: `Authorization: Bearer <token>`

### POST `/jobs/:id/apply`
Apply for a job
- **Access**: Private (Students & Alumni)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am interested in this position..."
  }
  ```

### PUT `/jobs/:id/applications/:applicationId`
Update application status
- **Access**: Private (Job poster only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "shortlisted"
  }
  ```

### GET `/jobs/my-jobs`
Get user's posted jobs
- **Access**: Private (Job poster)
- **Headers**: `Authorization: Bearer <token>`

### GET `/jobs/my-applications`
Get user's job applications
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

---

## Workshop Endpoints

### GET `/workshops`
Get all active workshops with filters
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search in topic, description, tags
  - `category`: Filter by category
  - `locationType`: Filter by location type (online/in-person/hybrid)
  - `upcoming`: Filter upcoming workshops only

### GET `/workshops/:id`
Get workshop by ID with attendees
- **Access**: Public

### POST `/workshops`
Create a new workshop
- **Access**: Private (Alumni only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "topic": "Advanced JavaScript Patterns",
    "description": "Learn advanced JavaScript patterns and best practices...",
    "date": "2024-02-15T14:00:00Z",
    "duration": 120,
    "location": {
      "type": "online",
      "onlineLink": "https://zoom.us/j/123456789"
    },
    "capacity": 50,
    "category": "technical",
    "tags": ["JavaScript", "Programming", "Web Development"],
    "materials": [
      {
        "title": "Workshop Slides",
        "url": "https://example.com/slides.pdf",
        "type": "presentation"
      }
    ],
    "registrationDeadline": "2024-02-14T23:59:59Z"
  }
  ```

### PUT `/workshops/:id`
Update workshop
- **Access**: Private (Workshop host only)
- **Headers**: `Authorization: Bearer <token>`

### DELETE `/workshops/:id`
Delete workshop
- **Access**: Private (Workshop host only)
- **Headers**: `Authorization: Bearer <token>`

### POST `/workshops/:id/register`
Register for a workshop
- **Access**: Private (Students & Alumni)
- **Headers**: `Authorization: Bearer <token>`

### DELETE `/workshops/:id/register`
Cancel workshop registration
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### PUT `/workshops/:id/attendees/:attendeeId`
Update attendee status
- **Access**: Private (Workshop host only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "attended"
  }
  ```

### GET `/workshops/my-workshops`
Get user's hosted workshops
- **Access**: Private (Workshop host)
- **Headers**: `Authorization: Bearer <token>`

### GET `/workshops/my-registrations`
Get user's workshop registrations
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

---

## Blog Endpoints

### GET `/blogs`
Get all published blogs with filters
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search in title, content, tags
  - `category`: Filter by category
  - `author`: Filter by author ID
  - `featured`: Filter featured blogs only

### GET `/blogs/featured`
Get featured blogs
- **Access**: Public
- **Query Parameters**:
  - `limit`: Number of blogs (default: 5)

### GET `/blogs/search`
Search blogs
- **Access**: Public
- **Query Parameters**:
  - `q`: Search query (required)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

### GET `/blogs/:id`
Get blog by ID with likes and comments
- **Access**: Public

### POST `/blogs`
Create a new blog post
- **Access**: Private (Alumni only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Career Tips for Recent Graduates",
    "content": "Starting your career after graduation can be challenging...",
    "excerpt": "Essential career advice for new graduates",
    "imageUrl": "https://example.com/image.jpg",
    "tags": ["career", "graduation", "tips"],
    "category": "career",
    "status": "published",
    "seo": {
      "metaTitle": "Career Tips for Recent Graduates - Alumni Association",
      "metaDescription": "Essential career advice for new graduates",
      "keywords": ["career", "graduation", "job search", "tips"]
    },
    "allowComments": true
  }
  ```

### PUT `/blogs/:id`
Update blog post
- **Access**: Private (Blog author only)
- **Headers**: `Authorization: Bearer <token>`

### DELETE `/blogs/:id`
Delete blog post
- **Access**: Private (Blog author only)
- **Headers**: `Authorization: Bearer <token>`

### POST `/blogs/:id/like`
Like/unlike a blog post
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### POST `/blogs/:id/comments`
Add comment to blog post
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "content": "Great article! Very helpful tips."
  }
  ```

### POST `/blogs/:id/comments/:commentId/replies`
Reply to a comment
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "content": "Thank you for your comment!"
  }
  ```

### PUT `/blogs/:id/comments/:commentId`
Approve/delete comment
- **Access**: Private (Blog author or admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "isApproved": true
  }
  ```

### GET `/blogs/my-blogs`
Get user's blog posts
- **Access**: Private (Blog author)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by status (draft/published/archived)

---

## Feedback Endpoints

### GET `/feedback/public`
Get public feedback
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `eventType`: Filter by event type

### POST `/feedback`
Submit feedback
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "eventType": "workshop",
    "eventId": "workshop_id_here",
    "eventModel": "Workshop",
    "rating": 4,
    "comments": "Great workshop! Very informative and well-organized.",
    "category": "content",
    "tags": ["workshop", "positive", "informative"],
    "isAnonymous": false,
    "isPublic": true,
    "attachments": [
      {
        "filename": "screenshot.png",
        "url": "https://example.com/screenshot.png",
        "type": "image"
      }
    ]
  }
  ```

### GET `/feedback`
Get all feedback (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `eventType`: Filter by event type
  - `status`: Filter by status
  - `priority`: Filter by priority
  - `rating`: Filter by rating

### GET `/feedback/:id`
Get feedback by ID
- **Access**: Private (Feedback owner or admin)
- **Headers**: `Authorization: Bearer <token>`

### PUT `/feedback/:id/status`
Update feedback status (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "addressed"
  }
  ```

### POST `/feedback/:id/response`
Add admin response to feedback (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "response": "Thank you for your feedback. We will address this issue."
  }
  ```

### POST `/feedback/:id/helpful`
Mark feedback as helpful
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### GET `/feedback/my-feedback`
Get user's feedback
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### GET `/feedback/stats`
Get feedback statistics (admin only)
- **Access**: Private (Admin)
- **Headers**: `Authorization: Bearer <token>`

### DELETE `/feedback/:id`
Delete feedback
- **Access**: Private (Feedback owner or admin)
- **Headers**: `Authorization: Bearer <token>`

---

## Mentorship Endpoints

### GET `/mentorship/mentors`
Get available mentors
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Search by name or major

### GET `/mentorship/requests`
Get mentorship requests
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by status

### POST `/mentorship/request`
Send mentorship request (students only)
- **Access**: Private (Students only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "mentorId": "mentor_user_id",
    "message": "I would like to request mentorship in software development."
  }
  ```

### PUT `/mentorship/request/:id`
Accept/reject mentorship request
- **Access**: Private (Mentor only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "accepted",
    "message": "I would be happy to mentor you!"
  }
  ```

### GET `/mentorship/relationships`
Get mentorship relationships
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### GET `/mentorship/chat/:relationshipId`
Get chat messages
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

### POST `/mentorship/chat/:relationshipId`
Send chat message
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "message": "Hello! How can I help you today?"
  }
  ```

### GET `/mentorship/stats`
Get mentorship statistics
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized to access this resource"
}
```

### 403 Forbidden
```json
{
  "message": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

---

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Pagination

Endpoints that return lists support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Role-Based Access

The API implements role-based access control:

- **Admin**: Full access to all endpoints
- **Alumni**: Can create jobs, workshops, blogs; can apply for jobs/workshops
- **Student**: Can apply for jobs/workshops; can submit feedback; can request mentorship

---

## Socket.IO Events

For real-time features like chat, the following Socket.IO events are available:

### Connection
- `connect`: User connects to socket
- `disconnect`: User disconnects from socket

### Chat Events
- `join-chat`: Join a specific chat room
- `leave-chat`: Leave a chat room
- `send-message`: Send a message to a chat room
- `receive-message`: Receive a message from a chat room

### Notification Events
- `notification`: Receive real-time notifications
- `user-online`: User comes online
- `user-offline`: User goes offline
