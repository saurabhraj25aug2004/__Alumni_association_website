import React from 'react';

const Workshops = () => {
  const upcomingWorkshops = [
    {
      id: 1,
      title: 'Modern Web Development with React',
      instructor: 'John Doe (Alumni)',
      date: '2024-12-01',
      time: '2:00 PM - 4:00 PM',
      location: 'Online',
      capacity: 25,
      registered: 18,
      description: 'Learn the latest React patterns and best practices for building modern web applications.'
    },
    {
      id: 2,
      title: 'Career Transition Workshop',
      instructor: 'Sarah Johnson (Alumni)',
      date: '2024-12-05',
      time: '6:00 PM - 8:00 PM',
      location: 'Campus Hall A',
      capacity: 30,
      registered: 25,
      description: 'Tips and strategies for successfully transitioning from student to professional life.'
    }
  ];

  const myWorkshops = [
    {
      id: 1,
      title: 'Data Science Fundamentals',
      date: '2024-11-20',
      status: 'Completed',
      participants: 22,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Interview Preparation',
      date: '2024-11-25',
      status: 'Scheduled',
      participants: 15,
      rating: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
          <p className="text-gray-600 mt-2">Learn from experts and share your knowledge</p>
        </div>

        <div className="mb-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Host a Workshop
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Workshops */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Workshops</h2>
            <div className="space-y-4">
              {upcomingWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{workshop.title}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {workshop.registered}/{workshop.capacity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workshop.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Instructor:</span> {workshop.instructor}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {workshop.date}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {workshop.time}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {workshop.location}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(workshop.registered / workshop.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Workshops */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Workshops</h2>
            <div className="space-y-4">
              {myWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{workshop.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      workshop.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {workshop.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Date:</span> {workshop.date}
                    </div>
                    <div>
                      <span className="font-medium">Participants:</span> {workshop.participants}
                    </div>
                  </div>
                  {workshop.rating && (
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm text-gray-600">{workshop.rating}/5</span>
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                    {workshop.status === 'Scheduled' && (
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workshop Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Workshops Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.7</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workshops;
