import React from 'react';

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: 'Alumni Meet 2024',
      content: 'Join us for the annual alumni meet on December 15th, 2024. Network with fellow alumni and share your experiences.',
      author: 'Admin',
      date: '2024-11-15',
      status: 'Published',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Job Fair Registration Open',
      content: 'Registration for the upcoming job fair is now open. Don\'t miss this opportunity to connect with top companies.',
      author: 'Admin',
      date: '2024-11-10',
      status: 'Draft',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Mentorship Program Launch',
      content: 'We are excited to announce the launch of our new mentorship program connecting current students with alumni.',
      author: 'Admin',
      date: '2024-11-05',
      status: 'Published',
      priority: 'High'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">Manage and create announcements for the community</p>
        </div>

        <div className="mb-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Announcement
          </button>
        </div>

        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {announcement.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.priority === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span>By {announcement.author}</span>
                  <span className="mx-2">•</span>
                  <span>{announcement.date}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Total Announcements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
