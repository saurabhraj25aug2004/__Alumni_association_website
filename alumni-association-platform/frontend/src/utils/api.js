import axios from 'axios';

// Resolve API base URL from env with sensible fallback
const DEFAULT_API_PORT = import.meta.env.VITE_API_PORT || 5000;
const ENV_API_URL = import.meta.env.VITE_API_URL;
const apiBaseUrl = ENV_API_URL || `http://localhost:${DEFAULT_API_PORT}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove Content-Type header for FormData to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (formData) => api.put('/auth/update-profile', formData),
  
  // Delete profile image
  deleteProfileImage: () => api.delete('/auth/delete-profile-image'),
  
  // Get pending users (admin only)
  getPendingUsers: () => api.get('/auth/pending-users'),
  
  // Approve/reject user (admin only)
  approveUser: (userId, isApproved) => 
    api.put(`/auth/approve-user/${userId}`, { isApproved }),
};

// Admin API functions
export const adminAPI = {
  // Get all users
  getAllUsers: () => api.get('/admin/users'),
  
  // Get analytics
  getAnalytics: () => api.get('/admin/analytics'),
  
  // Get user details
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  
  // Approve or reject user
  approveUser: (userId, isApproved, reason = '') =>
    api.put(`/admin/users/${userId}/approve`, { isApproved, reason }),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Job API functions
export const jobAPI = {
  // Get all jobs
  getAllJobs: (params = {}) => api.get('/jobs', { params }),
  
  // Get job by ID
  getJobById: (jobId) => api.get(`/jobs/${jobId}`),
  
  // Create job (alumni only)
  createJob: (formData) => api.post('/jobs', formData),
  
  // Update job (job author only)
  updateJob: (jobId, formData) => api.put(`/jobs/${jobId}`, formData),
  
  // Delete job (job author only)
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
  
  // Apply for job (student only) - accepts FormData with resume file
  applyForJob: (jobId, formData) => api.post(`/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get my jobs (alumni only)
  getMyJobs: () => api.get('/jobs/my-jobs'),
  
  // Get my applications (student only)
  getMyApplications: () => api.get('/jobs/my-applications'),
  
  // Get applied jobs (alias for my-applications)
  getAppliedJobs: () => api.get('/jobs/applied'),
  
  // Update application status (job author or admin)
  updateApplicationStatus: (jobId, applicationId, status) =>
    api.put(`/jobs/${jobId}/applications/${applicationId}`, { status }),
  
  // Admin: Update application status
  updateApplicationStatusByAdmin: (jobId, applicationId, status) =>
    api.put(`/jobs/${jobId}/status`, { applicationId, status }),
};

// Admin API functions for jobs and applications
export const adminJobAPI = {
  // Get all jobs for admin
  getAllJobs: (params = {}) => api.get('/admin/jobs', { params }),
  
  // Get all applications for admin
  getAllApplications: (params = {}) => api.get('/admin/applications', { params }),
};

// Announcement API functions
export const announcementAPI = {
  // Get all announcements (admin sees all, others see published only)
  getAllAnnouncements: (params = {}) => api.get('/announcements', { params }),
  
  // Get published announcements only (for students and alumni)
  getPublishedAnnouncements: (params = {}) => api.get('/announcements/published', { params }),
  
  // Get announcement by ID
  getAnnouncementById: (id) => api.get(`/announcements/${id}`),
  
  // Create announcement (admin only)
  createAnnouncement: (data) => api.post('/announcements', data),
  
  // Update announcement (admin only)
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  
  // Delete announcement (admin only)
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  
  // Get announcement statistics (admin only)
  getAnnouncementStats: () => api.get('/announcements/stats'),
};

// Workshop API functions
export const workshopAPI = {
  // Get all workshops
  getAllWorkshops: (params = {}) => api.get('/workshops', { params }),
  
  // Get workshop by ID
  getWorkshopById: (workshopId) => api.get(`/workshops/${workshopId}`),
  
  // Create workshop (alumni only)
  createWorkshop: (formData) => api.post('/workshops', formData),
  
  // Update workshop (workshop host only)
  updateWorkshop: (workshopId, formData) => 
    api.put(`/workshops/${workshopId}`, formData),
  
  // Delete workshop (workshop host only)
  deleteWorkshop: (workshopId) => api.delete(`/workshops/${workshopId}`),
  
  // Register for workshop (student only)
  registerForWorkshop: (workshopId) => 
    api.post(`/workshops/${workshopId}/register`),
  
  // Cancel workshop registration (student only)
  cancelWorkshopRegistration: (workshopId) =>
    api.delete(`/workshops/${workshopId}/register`),
  
  // Get my workshops (alumni only)
  getMyWorkshops: () => api.get('/workshops/my-workshops'),
  
  // Get my registrations (student only)
  getMyRegistrations: () => api.get('/workshops/my-registrations'),
  
  // Update attendee status (workshop host only)
  updateAttendeeStatus: (workshopId, userId, status) =>
    api.put(`/workshops/${workshopId}/attendees/${userId}`, { status }),
};

// Blog API functions
export const blogAPI = {
  // Get all blogs
  getAllBlogs: (params = {}) => api.get('/blogs', { params }),
  
  // Get blog by ID
  getBlogById: (blogId) => api.get(`/blogs/${blogId}`),
  
  // Create blog (alumni only)
  createBlog: (formData) => api.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Update blog (blog author only)
  updateBlog: (blogId, formData) => api.put(`/blogs/${blogId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete blog (blog author only)
  deleteBlog: (blogId) => api.delete(`/blogs/${blogId}`),
  
  // Like/unlike blog
  toggleLike: (blogId) => api.post(`/blogs/${blogId}/like`),
  
  // Add comment to blog
  addComment: (blogId, content) => 
    api.post(`/blogs/${blogId}/comments`, { content }),
  
  // Add reply to comment
  addReply: (blogId, commentId, content) =>
    api.post(`/blogs/${blogId}/comments/${commentId}/replies`, { content }),
  
  // Update comment
  updateComment: (blogId, commentId, content) =>
    api.put(`/blogs/${blogId}/comments/${commentId}`, { content }),
  
  // Get my blogs (alumni only)
  getMyBlogs: () => api.get('/blogs/my-blogs'),
  
  // Get featured blogs
  getFeaturedBlogs: () => api.get('/blogs/featured'),
  
  // Search blogs
  searchBlogs: (query) => api.get('/blogs/search', { params: { q: query } }),
};

// Feedback API functions
export const feedbackAPI = {
  // Submit feedback
  submitFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  
  // Get all feedback (admin only)
  getAllFeedback: (params = {}) => api.get('/feedback', { params }),
  
  // Get feedback by ID
  getFeedbackById: (feedbackId) => api.get(`/feedback/${feedbackId}`),
  
  // Get user's feedback
  getMyFeedback: (params = {}) => api.get('/feedback/my-feedback', { params }),
  
  // Get feedback by user ID
  getFeedbackByUserId: (userId, params = {}) => api.get(`/feedback/user/${userId}`, { params }),
  
  // Get feedback summary (admin only)
  getFeedbackSummary: () => api.get('/feedback/summary'),
  
  // Get feedback stats (admin only)
  getFeedbackStats: (params = {}) => api.get('/feedback/stats', { params }),
  
  // Update feedback status (admin only) - supports both PATCH and PUT
  updateFeedbackStatus: (feedbackId, status) =>
    api.patch(`/feedback/${feedbackId}`, { status }),
  
  // Add admin response (admin only)
  addAdminResponse: (feedbackId, response) =>
    api.post(`/feedback/${feedbackId}/response`, { response }),
  
  // Mark feedback as helpful
  markAsHelpful: (feedbackId) => api.post(`/feedback/${feedbackId}/helpful`),
  
  // Delete feedback
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
  
  // Get public feedback
  getPublicFeedback: () => api.get('/feedback/public'),
  
  // Get feedback stats (admin only)
  getFeedbackStats: () => api.get('/feedback/stats'),
  
  // Delete feedback (admin only)
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
};

// Chat API functions
export const chatAPI = {
  // Get all chats for the user
  getUserChats: () => api.get('/chat'),
  
  // Get available mentors (for students)
  getAvailableMentors: () => api.get('/chat/mentors'),
  
  // Get available mentees (for alumni)
  getAvailableMentees: () => api.get('/chat/mentees'),
  
  // Create or get chat with another user
  createOrGetChat: (otherUserId) => api.get(`/chat/user/${otherUserId}`),
  
  // Get messages for a specific chat
  getChatMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  
  // Send a message in a chat
  sendMessage: (chatId, messageData) => api.post(`/chat/${chatId}/messages`, messageData),
  
  // Mark chat as read
  markChatAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
};

// Mentorship API functions (Program-based)
export const mentorshipAPI = {
  // Get all mentorship programs
  getAllPrograms: (params = {}) => api.get('/mentorship', { params }),
  
  // Get mentorship program by ID
  getProgramById: (id) => api.get(`/mentorship/${id}`),
  
  // Create mentorship program (alumni only)
  createProgram: (data) => api.post('/mentorship', data),
  
  // Update mentorship program (alumni only)
  updateProgram: (id, data) => api.put(`/mentorship/${id}`, data),
  
  // Delete mentorship program (alumni only)
  deleteProgram: (id) => api.delete(`/mentorship/${id}`),
  
  // Request to join program (student only)
  requestMentorship: (programId, message) =>
    api.post(`/mentorship/request/${programId}`, { message }),
  
  // Accept/Reject request (alumni only)
  respondToRequest: (programId, requestId, status) =>
    api.put(`/mentorship/request/${programId}/${requestId}`, { status }),
  
  // Legacy routes (for backward compatibility)
  getAvailableMentors: (params = {}) => api.get('/mentorship/mentors', { params }),
  getMentorshipRequests: (params = {}) => api.get('/mentorship/requests', { params }),
  getMentorRequests: (params = {}) => api.get('/mentorship/mentor/requests', { params }),
  getMenteeMentorships: (params = {}) => api.get('/mentorship/mentee/mentorships', { params }),
  sendMentorshipRequest: (mentorId, message) =>
    api.post('/mentorship/request', { mentorId, message }),
  respondToMentorshipRequest: (requestId, status, response) =>
    api.put(`/mentorship/request/${requestId}`, { status, response }),
  getMentorshipRelationships: (params = {}) => api.get('/mentorship/relationships', { params }),
  getChatMessages: (relationshipId) => 
    api.get(`/mentorship/chat/${relationshipId}`),
  sendChatMessage: (relationshipId, message) =>
    api.post(`/mentorship/chat/${relationshipId}`, { message }),
  getMentorshipStats: () => api.get('/mentorship/stats'),
};

// Admin API functions for mentorships
export const adminMentorshipAPI = {
  // Get all mentorship programs for admin
  getAllPrograms: (params = {}) => api.get('/mentorship/all', { params }),
  // Legacy route
  getAllMentorships: (params = {}) => api.get('/admin/mentorships', { params }),
};

// File upload helper
export const uploadFile = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    throw new Error('File upload failed');
  }
};

export default api;
