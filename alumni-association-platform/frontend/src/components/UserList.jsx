import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../alumni-association-platform/frontend/src/utils/api';
import useAuthStore from '../store/authStore';

const UserList = ({ onUserSelect, userType = 'mentors' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const apiFunction = userType === 'mentors' ? chatAPI.getAvailableMentors : chatAPI.getAvailableMentees;
      const response = await apiFunction();
      setUsers(response.data.data);
    } catch (err) {
      setError(`Failed to load ${userType}`);
      console.error(`Fetch ${userType} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = async (selectedUser) => {
    try {
      const response = await chatAPI.createOrGetChat(selectedUser._id);
      onUserSelect(response.data.data);
    } catch (err) {
      console.error('Start chat error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${userType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {userType} found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : `No ${userType} are currently available.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((userItem) => (
            <div
              key={userItem._id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={userItem.profileImage?.url || 'https://via.placeholder.com/48'}
                    alt={userItem.name}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {userItem.name}
                    </h3>
                    <button
                      onClick={() => handleStartChat(userItem)}
                      className="flex-shrink-0 ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {userItem.email}
                  </p>
                  
                  {userItem.major && (
                    <p className="text-sm text-gray-600">
                      {userItem.major} • Class of {userItem.graduationYear}
                    </p>
                  )}
                  
                  {userItem.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {userItem.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
