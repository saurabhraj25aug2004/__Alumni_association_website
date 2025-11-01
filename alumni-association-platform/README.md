# Alumni Association Platform

A comprehensive MERN stack platform for managing alumni associations with role-based dashboards for Administrators, Alumni, and Students.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with role-based access control
- **User approval system** for new registrations
- **Protected routes** for different user roles
- **Profile management** with image upload support

### 👥 User Management (Admin)
- **User approval/rejection** with reason tracking
- **Analytics dashboard** with key metrics
- **User management** with search and filtering
- **Feedback management** with status tracking

### 💼 Job Portal
- **Job posting** by alumni
- **Job applications** by students
- **Application tracking** and status updates
- **Job search** and filtering

### 📚 Workshops
- **Workshop creation** by alumni
- **Workshop registration** by students
- **Online/offline workshop** support
- **Attendance tracking** and management

### 📝 Blog System
- **Blog creation** and editing by alumni
- **Rich text content** with image support
- **Like and comment** functionality
- **Category-based organization**

### 🤝 Mentorship Program
- **Mentor-mentee matching**
- **Mentorship requests** and responses
- **Chat functionality** between mentors and mentees
- **Mentorship relationship** tracking

### 💬 Feedback System
- **Feedback submission** by students
- **Feedback management** by admins
- **Category-based feedback** organization
- **Response tracking**

### 💬 Real-time Chat
- **Socket.IO integration** for real-time messaging
- **Chat between users** with read receipts
- **Typing indicators** and notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for routing
- **Zustand** for state management
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** with Cloudinary for file uploads
- **Socket.IO** for real-time communication
- **Bcrypt** for password hashing

### External Services
- **Cloudinary** for image storage
- **MongoDB Atlas** for database hosting

## 📁 Project Structure

```
alumni-association-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-association-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 👤 User Roles & Features

### 🔧 Administrator
- **Dashboard**: Analytics and overview
- **User Management**: Approve/reject users, manage accounts
- **Feedback Management**: Review and respond to feedback
- **System Analytics**: View platform statistics

### 👨‍🎓 Alumni
- **Profile Management**: Update profile and upload images
- **Job Posting**: Create and manage job listings
- **Workshop Hosting**: Create and manage workshops
- **Blog Writing**: Create and edit blog posts
- **Mentorship**: Offer mentorship to students
- **Chat**: Communicate with students and other alumni

### 🎓 Student
- **Job Applications**: Apply for posted jobs
- **Workshop Registration**: Register for workshops
- **Blog Reading**: Read and interact with blog posts
- **Mentorship Requests**: Request mentorship from alumni
- **Feedback Submission**: Submit feedback and suggestions
- **Chat**: Communicate with mentors and alumni

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/users/:id/approve` - Approve/reject user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (alumni)
- `POST /api/jobs/:id/apply` - Apply for job (student)

### Workshops
- `GET /api/workshops` - Get all workshops
- `POST /api/workshops` - Create workshop (alumni)
- `POST /api/workshops/:id/register` - Register for workshop (student)

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create blog (alumni)
- `POST /api/blogs/:id/like` - Like/unlike blog

### Mentorship
- `GET /api/mentorship/mentors` - Get available mentors
- `POST /api/mentorship/request` - Send mentorship request
- `PUT /api/mentorship/request/:id` - Respond to request

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin)

## 🎯 Key Features Implemented

### ✅ Fully Functional Components
- **User Authentication**: Complete login/register with role-based access
- **Admin Dashboard**: Analytics, user management, feedback handling
- **Job Portal**: Post jobs, apply, track applications
- **Workshop System**: Create workshops, register, manage attendance
- **Blog System**: Create, edit, like, comment on blogs
- **Mentorship**: Request/respond to mentorship, chat functionality
- **Feedback System**: Submit and manage feedback
- **Real-time Chat**: Socket.IO integration for messaging
- **File Upload**: Image uploads for profiles, blogs, workshops
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

### 🔄 Data Flow
- **Real-time Updates**: Socket.IO for chat and notifications
- **State Management**: Zustand for client-side state
- **API Integration**: Axios with interceptors for authentication
- **Error Handling**: Comprehensive error handling throughout
- **Loading States**: Loading indicators for better UX

## 🧪 Testing

### Test Credentials
After running the seed script, you can use these test accounts:

**Admin:**
- Email: `admin@alumni.com`
- Password: `admin123`

**Alumni:**
- Email: `michael.chen@alumni.com`
- Password: `password123`

**Student:**
- Email: `alex.martinez@student.com`
- Password: `password123`

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Render, Heroku, or Railway
3. Update frontend API base URL

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a fully functional MERN stack application with all major features implemented and tested. The platform supports real-time communication, file uploads, role-based access control, and comprehensive user management.
