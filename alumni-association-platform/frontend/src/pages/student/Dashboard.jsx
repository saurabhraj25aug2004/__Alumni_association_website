import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State for dashboard data
  const [academicProgress, setAcademicProgress] = useState({
    currentSemester: 6,
    cgpa: 3.8,
    coursesEnrolled: 5,
    creditsCompleted: 85,
    totalCredits: 120
  });
  
  const [mentorshipStatus, setMentorshipStatus] = useState({
    activeMentor: 'John Doe',
    mentorRole: 'Software Engineer',
    nextSession: 'Tomorrow',
    pendingRequests: 2,
    totalSessions: 8
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with realistic data
      const mockActivities = [
        {
          id: 1,
          type: 'mentorship',
          message: 'Completed mentorship session with John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: '🤝'
        },
        {
          id: 2,
          type: 'workshop',
          message: 'Registered for "Advanced Web Development" workshop',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: '🎓'
        },
        {
          id: 3,
          type: 'feedback',
          message: 'Submitted feedback for Data Structures course',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          icon: '📝'
        },
        {
          id: 4,
          type: 'job',
          message: 'Applied for Software Engineering Internship at TechCorp',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          icon: '💼'
        }
      ];

      const mockUpcomingEvents = [
        {
          id: 1,
          type: 'workshop',
          title: 'Advanced Web Development',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          time: '10:00 AM',
          location: 'Room 301, Engineering Building'
        },
        {
          id: 2,
          type: 'mentorship',
          title: 'Mentorship Session with John Doe',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
          time: '3:00 PM',
          location: 'Virtual Meeting'
        },
        {
          id: 3,
          type: 'career_fair',
          title: 'Spring Career Fair',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          time: '9:00 AM',
          location: 'Main Campus Auditorium'
        }
      ];

      setRecentActivities(mockActivities);
      setUpcomingEvents(mockUpcomingEvents);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleFindMentor = () => {
    navigate('/student/mentorship');
  };

  const handleBrowseWorkshops = () => {
    navigate('/student/workshops');
  };

  const handleSubmitFeedback = () => {
    navigate('/student/feedback');
  };

  const handleBrowseJobs = () => {
    navigate('/student/jobs');
  };

  const handleViewProfile = () => {
    navigate('/student/profile');
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Student'}! 🎓
        </h1>
        <p className="text-gray-600 text-lg">Track your academic progress and connect with mentors.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Academic Progress */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Progress</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Semester</span>
              <span className="font-semibold text-blue-600">{academicProgress.currentSemester}th</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CGPA</span>
              <span className="font-semibold text-green-600">{academicProgress.cgpa}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Courses Enrolled</span>
              <span className="font-semibold text-purple-600">{academicProgress.coursesEnrolled}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Credits Completed</span>
              <span className="font-semibold text-orange-600">{academicProgress.creditsCompleted}/{academicProgress.totalCredits}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round((academicProgress.creditsCompleted / academicProgress.totalCredits) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(academicProgress.creditsCompleted / academicProgress.totalCredits) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentorship Status */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mentorship Status</h2>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800">Active Mentor: {mentorshipStatus.activeMentor}</p>
              <p className="text-xs text-gray-500">({mentorshipStatus.mentorRole})</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Next session: <span className="font-medium text-green-600">{mentorshipStatus.nextSession}</span></p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Pending requests: <span className="font-medium text-orange-600">{mentorshipStatus.pendingRequests}</span></p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Total sessions: <span className="font-medium text-blue-600">{mentorshipStatus.totalSessions}</span></p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button 
                onClick={handleFindMentor}
                className="btn btn-primary w-full text-sm"
              >
                Find New Mentor
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={handleFindMentor}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <span className="mr-2">🤝</span>
              Find Mentor
            </button>
            <button 
              onClick={handleBrowseWorkshops}
              className="btn btn-success w-full flex items-center justify-center"
            >
              <span className="mr-2">🎓</span>
              Browse Workshops
            </button>
            <button 
              onClick={handleSubmitFeedback}
              className="btn w-full flex items-center justify-center"
              style={{backgroundColor: '#8b5cf6', color: 'white'}}
            >
              <span className="mr-2">📝</span>
              Submit Feedback
            </button>
            <button 
              onClick={handleBrowseJobs}
              className="btn btn-secondary w-full flex items-center justify-center"
            >
              <span className="mr-2">💼</span>
              Browse Jobs
            </button>
            <button 
              onClick={handleViewProfile}
              className="btn w-full flex items-center justify-center"
              style={{backgroundColor: '#f59e0b', color: 'white'}}
            >
              <span className="mr-2">👤</span>
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="text-sm text-gray-600 border-l-2 border-green-200 pl-3">
                <div className="flex items-start">
                  <span className="mr-2 text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)} at {event.time}</p>
                  </div>
                  <span className="text-lg">
                    {event.type === 'workshop' ? '🎓' : 
                     event.type === 'mentorship' ? '🤝' : '💼'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;



