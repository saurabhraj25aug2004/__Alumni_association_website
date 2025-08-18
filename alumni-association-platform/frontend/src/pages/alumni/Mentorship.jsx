import React from 'react';

const Mentorship = () => {
  const mentorshipPrograms = [
    {
      id: 1,
      title: 'Career Guidance Program',
      description: 'Help current students with career advice and industry insights',
      mentees: 3,
      status: 'Active',
      nextSession: '2024-12-01'
    },
    {
      id: 2,
      title: 'Technical Skills Workshop',
      description: 'Conduct workshops on modern development technologies',
      mentees: 5,
      status: 'Active',
      nextSession: '2024-11-25'
    }
  ];

  const menteeRequests = [
    {
      id: 1,
      name: 'Alice Johnson',
      year: '3rd Year',
      major: 'Computer Science',
      message: 'I would love to learn about software development best practices and career opportunities.',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Bob Smith',
      year: '2nd Year',
      major: 'Information Technology',
      message: 'Looking for guidance on choosing the right specialization and internship opportunities.',
      status: 'Accepted'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-2">Connect with students and share your expertise</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Programs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentorship Programs</h2>
            <div className="space-y-4">
              {mentorshipPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{program.title}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {program.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{program.mentees} mentees</span>
                    <span>Next session: {program.nextSession}</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      Schedule Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Create New Program
            </button>
          </div>

          {/* Mentee Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentee Requests</h2>
            <div className="space-y-4">
              {menteeRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.year} • {request.major}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'Accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{request.message}</p>
                  {request.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Accept
                      </button>
                      <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentorship Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Total Mentees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Sessions Conducted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentorship;
