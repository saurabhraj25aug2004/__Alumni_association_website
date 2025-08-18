import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireApproval = true,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, isApproved, hasAnyRole } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user is approved (if required)
  if (requireApproval && !isApproved()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Account Pending Approval
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is currently pending approval from an administrator. 
              You will be able to access the platform once your account is approved.
            </p>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. 
              Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
            >
              Go Back
            </button>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Specific route components for different roles
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const AlumniRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['alumni']}>
    {children}
  </ProtectedRoute>
);

export const StudentRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student']}>
    {children}
  </ProtectedRoute>
);

export const AlumniAndAdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['alumni', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const StudentAndAdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[]}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
