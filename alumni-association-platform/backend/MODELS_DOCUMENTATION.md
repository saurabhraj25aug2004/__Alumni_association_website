# Alumni Association Platform - Models Documentation

## Overview

This document describes all the Mongoose models used in the Alumni Association Platform backend.

---

## 1. User Model

**File**: `models/User.js`

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Hashed password (min 6 chars) |
| `role` | String | Yes | Enum: 'admin', 'alumni', 'student' |
| `profileImage` | String | No | URL to profile image |
| `isApproved` | Boolean | No | Default: false (requires admin approval) |
| `graduationYear` | Number | Conditional* | Required for alumni/students |
| `major` | String | Conditional* | Required for alumni/students |

*Conditional: Required only for alumni and student roles

### Virtual Fields
- `fullName`: Combination of firstName and lastName

### Methods
- `comparePassword(candidatePassword)`: Compares password with bcrypt

### Usage Example
```javascript
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'alumni',
  graduationYear: 2020,
  major: 'Computer Science'
});
```

---

## 2. Job Model

**File**: `models/Job.js`

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Job title |
| `description` | String | Yes | Job description |
| `company` | String | Yes | Company name |
| `location` | String | Yes | Job location |
| `type` | String | Yes | Enum: 'full-time', 'part-time', 'internship', 'contract' |
| `salary` | Object | No | {min, max, currency} |
| `requirements` | [String] | No | Array of job requirements |
| `skills` | [String] | No | Array of required skills |
| `postedBy` | ObjectId | Yes | Reference to User (job poster) |
| `applicants` | Array | No | Array of applicant objects |
| `isActive` | Boolean | No | Default: true |
| `deadline` | Date | No | Application deadline |

### Applicant Object Structure
```javascript
{
  user: ObjectId,        // Reference to User
  appliedAt: Date,       // Application date
  status: String,        // 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'
  resume: String,        // URL to resume
  coverLetter: String    // Cover letter text
}
```

### Virtual Fields
- `applicantCount`: Number of applicants

### Indexes
- Text index on title, description, company

### Usage Example
```javascript
const job = new Job({
  title: 'Software Engineer',
  description: 'We are looking for a skilled software engineer...',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  type: 'full-time',
  salary: { min: 80000, max: 120000, currency: 'USD' },
  requirements: ['3+ years experience', 'JavaScript', 'React'],
  skills: ['JavaScript', 'React', 'Node.js'],
  postedBy: userId,
  deadline: new Date('2024-12-31')
});
```

---

## 3. Workshop Model

**File**: `models/Workshop.js`

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | String | Yes | Workshop topic |
| `description` | String | Yes | Workshop description |
| `host` | ObjectId | Yes | Reference to User (workshop host) |
| `date` | Date | Yes | Workshop date and time |
| `duration` | Number | Yes | Duration in minutes (15-480) |
| `location` | Object | Yes | Location details |
| `capacity` | Number | Yes | Maximum attendees |
| `attendees` | Array | No | Array of attendee objects |
| `category` | String | Yes | Enum: 'career', 'technology', 'leadership', 'networking', 'skills', 'industry' |
| `tags` | [String] | No | Array of tags |
| `materials` | Array | No | Array of material objects |
| `isActive` | Boolean | No | Default: true |
| `registrationDeadline` | Date | No | Registration deadline |

### Location Object Structure
```javascript
{
  type: String,          // 'online', 'in-person', 'hybrid'
  address: String,       // Required for in-person/hybrid
  onlineLink: String     // Required for online/hybrid
}
```

### Attendee Object Structure
```javascript
{
  user: ObjectId,        // Reference to User
  registeredAt: Date,    // Registration date
  status: String,        // 'registered', 'attended', 'no-show', 'cancelled'
  feedback: {            // Optional feedback
    rating: Number,      // 1-5 rating
    comment: String      // Feedback comment
  }
}
```

### Material Object Structure
```javascript
{
  title: String,         // Material title
  url: String,          // Material URL
  type: String          // 'document', 'video', 'presentation', 'link'
}
```

### Virtual Fields
- `attendeeCount`: Number of attendees
- `availableSpots`: Available spots remaining
- `isFull`: Whether workshop is full
- `registrationOpen`: Whether registration is still open

### Indexes
- Text index on topic, description, tags

### Usage Example
```javascript
const workshop = new Workshop({
  topic: 'Advanced JavaScript Patterns',
  description: 'Learn advanced JavaScript patterns and best practices...',
  host: userId,
  date: new Date('2024-02-15T14:00:00Z'),
  duration: 120,
  location: {
    type: 'online',
    onlineLink: 'https://zoom.us/j/123456789'
  },
  capacity: 50,
  category: 'technology',
  tags: ['JavaScript', 'Programming', 'Web Development'],
  registrationDeadline: new Date('2024-02-14T23:59:59Z')
});
```

---

## 4. Blog Model

**File**: `models/Blog.js`

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Blog post title |
| `content` | String | Yes | Blog post content |
| `excerpt` | String | Yes | Short excerpt (max 200 chars) |
| `author` | ObjectId | Yes | Reference to User (blog author) |
| `imageUrl` | String | No | Featured image URL |
| `tags` | [String] | No | Array of tags |
| `category` | String | Yes | Enum: 'career', 'technology', 'industry', 'alumni-spotlight', 'tips', 'news', 'other' |
| `status` | String | No | Enum: 'draft', 'published', 'archived' |
| `publishedAt` | Date | Conditional* | Publication date |
| `readTime` | Number | No | Reading time in minutes |
| `views` | Number | No | View count (default: 0) |
| `likes` | Array | No | Array of like objects |
| `comments` | Array | No | Array of comment objects |
| `seo` | Object | No | SEO metadata |
| `isFeatured` | Boolean | No | Default: false |
| `allowComments` | Boolean | No | Default: true |

*Conditional: Required when status is 'published'

### Like Object Structure
```javascript
{
  user: ObjectId,        // Reference to User
  likedAt: Date          // Like timestamp
}
```

### Comment Object Structure
```javascript
{
  user: ObjectId,        // Reference to User
  content: String,       // Comment content
  createdAt: Date,       // Comment timestamp
  isApproved: Boolean,   // Approval status
  replies: Array         // Array of reply objects
}
```

### SEO Object Structure
```javascript
{
  metaTitle: String,     // SEO title
  metaDescription: String, // SEO description
  keywords: [String]     // SEO keywords
}
```

### Virtual Fields
- `likeCount`: Number of likes
- `commentCount`: Total number of comments
- `approvedCommentCount`: Number of approved comments
- `estimatedReadTime`: Calculated reading time

### Indexes
- Text index on title, content, tags

### Pre-save Middleware
- Automatically sets `publishedAt` when status changes to 'published'
- Generates excerpt from content if not provided
- Calculates reading time if not provided

### Usage Example
```javascript
const blog = new Blog({
  title: 'Career Tips for Recent Graduates',
  content: 'Starting your career after graduation can be challenging...',
  author: userId,
  imageUrl: 'https://example.com/image.jpg',
  tags: ['career', 'graduation', 'tips'],
  category: 'career',
  status: 'published',
  seo: {
    metaTitle: 'Career Tips for Recent Graduates - Alumni Association',
    metaDescription: 'Essential career advice for new graduates',
    keywords: ['career', 'graduation', 'job search', 'tips']
  }
});
```

---

## 5. Feedback Model

**File**: `models/Feedback.js`

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | ObjectId | Yes | Reference to User (feedback author) |
| `eventType` | String | Yes | Enum: 'workshop', 'job', 'blog', 'platform', 'mentorship', 'event', 'other' |
| `eventId` | ObjectId | No | Reference to specific event |
| `eventModel` | String | Conditional* | Model name for eventId reference |
| `rating` | Number | Yes | Rating 1-5 |
| `comments` | String | Yes | Feedback comments (max 1000 chars) |
| `category` | String | Yes | Enum: 'general', 'technical', 'content', 'user-experience', 'support', 'suggestion' |
| `status` | String | No | Enum: 'pending', 'reviewed', 'addressed', 'closed' |
| `priority` | String | No | Enum: 'low', 'medium', 'high', 'critical' |
| `adminResponse` | Object | No | Admin response object |
| `tags` | [String] | No | Array of tags |
| `isAnonymous` | Boolean | No | Default: false |
| `isPublic` | Boolean | No | Default: false |
| `helpful` | Array | No | Array of helpful votes |
| `attachments` | Array | No | Array of attachment objects |

*Conditional: Required when eventId is provided

### Admin Response Object Structure
```javascript
{
  admin: ObjectId,       // Reference to admin User
  response: String,      // Admin response text
  respondedAt: Date      // Response timestamp
}
```

### Helpful Vote Object Structure
```javascript
{
  user: ObjectId,        // Reference to User
  markedAt: Date         // Vote timestamp
}
```

### Attachment Object Structure
```javascript
{
  filename: String,      // File name
  url: String,          // File URL
  type: String          // 'image', 'document', 'video'
}
```

### Virtual Fields
- `helpfulCount`: Number of helpful votes
- `averageRating`: Average rating (for aggregation)

### Indexes
- Text index on comments, tags
- Compound indexes for efficient queries

### Pre-save Middleware
- Automatically sets priority based on rating:
  - Rating ≤ 2: 'high' priority
  - Rating ≤ 3: 'medium' priority
  - Rating > 3: 'low' priority

### Static Methods
- `getAverageRating(eventType, eventId)`: Get average rating for specific event
- `getFeedbackStats(eventType)`: Get feedback statistics

### Usage Example
```javascript
const feedback = new Feedback({
  user: userId,
  eventType: 'workshop',
  eventId: workshopId,
  eventModel: 'Workshop',
  rating: 4,
  comments: 'Great workshop! Very informative and well-organized.',
  category: 'content',
  tags: ['workshop', 'positive', 'informative'],
  isPublic: true
});
```

---

## Model Relationships

### One-to-Many Relationships
- **User → Jobs**: A user can post multiple jobs
- **User → Workshops**: A user can host multiple workshops
- **User → Blogs**: A user can write multiple blog posts
- **User → Feedback**: A user can submit multiple feedback entries

### Many-to-Many Relationships
- **Jobs ↔ Users**: Users can apply to multiple jobs, jobs can have multiple applicants
- **Workshops ↔ Users**: Users can attend multiple workshops, workshops can have multiple attendees
- **Blogs ↔ Users**: Users can like multiple blogs, blogs can have multiple likes
- **Blogs ↔ Users**: Users can comment on multiple blogs, blogs can have multiple comments

### Referential Integrity
All models use `ObjectId` references to maintain data consistency. When a referenced document is deleted, consider implementing cascade deletion or setting references to null.

---

## Database Indexes

### Text Search Indexes
- **User**: email (unique)
- **Job**: title, description, company
- **Workshop**: topic, description, tags
- **Blog**: title, content, tags
- **Feedback**: comments, tags

### Performance Indexes
- **Job**: postedBy, isActive, deadline
- **Workshop**: host, date, isActive, category
- **Blog**: author, status, publishedAt, category
- **Feedback**: user, eventType, eventId, status, priority

---

## Best Practices

### Data Validation
- Use Mongoose schema validation for required fields
- Implement custom validation for complex business rules
- Use enums for constrained values

### Performance
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use virtual fields for computed properties

### Security
- Never store sensitive data in plain text
- Use proper authentication and authorization
- Validate input data before saving

### Maintenance
- Use timestamps for audit trails
- Implement soft deletes where appropriate
- Regular database backups and monitoring
