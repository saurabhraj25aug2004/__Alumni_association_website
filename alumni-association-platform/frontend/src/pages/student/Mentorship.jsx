import React from 'react';

const Mentorship = () => {
  const availableMentors = [
    {
      id: 1,
      name: 'John Doe',
      company: 'Tech Solutions Inc.',
      position: 'Senior Software Engineer',
      expertise: ['React', 'Node.js', 'Career Guidance'],
      rating: 4.8,
      mentees: 3,
      available: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Innovation Labs',
      position: 'Product Manager',
      expertise: ['Product Management', 'Leadership', 'Strategy'],
      rating: 4.9,
      mentees: 2,
      available: true
    }
  ];

  const myMentorships = [
    {
      id: 1,
      mentorName: 'Mike Wilson',
      program: 'Career Guidance Program',
      status: 'Active',
      nextSession: '2024-12-01',
      sessionsCompleted: 3
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-2">Connect with alumni mentors and grow your career</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Mentors */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Mentors</h2>
            <div className="space-y-4">
              {availableMentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                      <p className="text-gray-600">{mentor.position} at {mentor.company}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mentor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {mentor.available ? 'Available' : 'Full'}
                    </span>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm text-gray-600">{mentor.rating}</span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{mentor.mentees} mentees</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Request Mentorship
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Mentorships */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentorships</h2>
            <div className="space-y-4">
              {myMentorships.map((mentorship) => (
                <div key={mentorship.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{mentorship.program}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {mentorship.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">Mentor: {mentorship.mentorName}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Next Session:</span> {mentorship.nextSession}
                    </div>
                    <div>
                      <span className="font-medium">Sessions Completed:</span> {mentorship.sessionsCompleted}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Schedule Session
                    </button>
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      View Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentorship;
