# Alumni Association Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing alumni associations.

## Project Structure

```
alumni-association-platform/
├── frontend/          # React.js + Vite + TailwindCSS
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── backend/           # Node.js + Express.js + MongoDB
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── config/
    ├── server.js
    └── package.json
```

## Frontend (React.js + Vite + TailwindCSS)

### Features
- React 18 with Vite for fast development
- TailwindCSS for styling
- Modern component architecture

### Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Backend (Node.js + Express.js + MongoDB)

### Features
- Express.js server with MVC architecture
- MongoDB with Mongoose ODM
- JWT authentication
- RESTful API endpoints
- CORS enabled
- Environment variable configuration

### Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/alumni_association
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:5000`

### API Endpoints

- `GET /` - API status
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

## Technologies Used

### Frontend
- React.js 18
- Vite
- TailwindCSS
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

## Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Running Both Applications

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Status

This is a scaffolded project with basic setup. The following features are ready for development:

- ✅ Project structure
- ✅ Dependencies installed
- ✅ Basic server setup
- ✅ Database connection
- ✅ User model and basic CRUD operations
- ✅ API routes structure
- ✅ Frontend with TailwindCSS

## Next Steps

1. Implement authentication system
2. Add more models (Events, Posts, etc.)
3. Create frontend components
4. Implement state management
5. Add form validation
6. Implement file upload functionality
7. Add admin dashboard
8. Implement real-time features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
