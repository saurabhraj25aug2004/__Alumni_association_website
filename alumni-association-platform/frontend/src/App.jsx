import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Components
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute, { 
  AdminRoute, 
  AlumniRoute, 
  StudentRoute, 
  AlumniAndAdminRoute,
  StudentAndAdminRoute 
} from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Announcements from './pages/admin/Announcements';
import Feedback from './pages/admin/Feedback';

// Alumni Pages
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniProfile from './pages/alumni/Profile';
import Mentorship from './pages/alumni/Mentorship';
import JobPortal from './pages/alumni/JobPortal';
import Workshops from './pages/alumni/Workshops';
import Blogs from './pages/alumni/Blogs';
import BlogForm from './components/BlogForm';
import BlogDetail from './pages/BlogDetail';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentMentorship from './pages/student/Mentorship';
import StudentJobPortal from './pages/student/JobPortal';
import StudentWorkshops from './pages/student/Workshops';
import StudentBlogs from './pages/student/Blogs';
import StudentFeedback from './pages/student/Feedback';
import BlogForm from './components/BlogForm';
import BlogDetail from './pages/BlogDetail';
import WorkshopForm from './components/WorkshopForm';

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state from localStorage
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="pt-16 min-h-screen">
          <div className="fade-in">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><Announcements /></AdminRoute>} />
            <Route path="/admin/feedback" element={<AdminRoute><Feedback /></AdminRoute>} />

            {/* Alumni Routes */}
            <Route path="/alumni" element={<AlumniRoute><Navigate to="/alumni/dashboard" replace /></AlumniRoute>} />
            <Route path="/alumni/dashboard" element={<AlumniRoute><AlumniDashboard /></AlumniRoute>} />
            <Route path="/alumni/profile" element={<AlumniRoute><AlumniProfile /></AlumniRoute>} />
            <Route path="/alumni/mentorship" element={<AlumniRoute><Mentorship /></AlumniRoute>} />
            <Route path="/alumni/jobs" element={<AlumniRoute><JobPortal /></AlumniRoute>} />
            <Route path="/alumni/workshops" element={<AlumniRoute><Workshops /></AlumniRoute>} />
            <Route path="/alumni/blogs" element={<AlumniRoute><Blogs /></AlumniRoute>} />
            <Route path="/alumni/blogs/new" element={<AlumniRoute><BlogForm /></AlumniRoute>} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/blogs/:id/edit" element={<AlumniRoute><BlogForm isEditing /></AlumniRoute>} />
            <Route path="/alumni/workshops/new" element={<AlumniRoute><WorkshopForm /></AlumniRoute>} />
            <Route path="/workshops/:id/edit" element={<AlumniRoute><WorkshopForm isEditing /></AlumniRoute>} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentRoute><Navigate to="/student/dashboard" replace /></StudentRoute>} />
            <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
            <Route path="/student/mentorship" element={<StudentRoute><StudentMentorship /></StudentRoute>} />
            <Route path="/student/jobs" element={<StudentRoute><StudentJobPortal /></StudentRoute>} />
            <Route path="/student/workshops" element={<StudentRoute><StudentWorkshops /></StudentRoute>} />
            <Route path="/student/blogs" element={<StudentRoute><StudentBlogs /></StudentRoute>} />
            <Route path="/student/feedback" element={<StudentRoute><StudentFeedback /></StudentRoute>} />

            {/* Shared Routes (accessible by multiple roles) */}
            <Route path="/jobs" element={
              <StudentAndAdminRoute>
                <JobPortal />
              </StudentAndAdminRoute>
            } />
            <Route path="/workshops" element={
              <StudentAndAdminRoute>
                <Workshops />
              </StudentAndAdminRoute>
            } />
            <Route path="/blogs" element={
              <StudentAndAdminRoute>
                <Blogs />
              </StudentAndAdminRoute>
            } />
            <Route path="/blogs/new" element={<AlumniRoute><BlogForm /></AlumniRoute>} />
            <Route path="/blogs/:id/edit" element={<AlumniRoute><BlogForm isEditing /></AlumniRoute>} />
            <Route path="/blogs/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
