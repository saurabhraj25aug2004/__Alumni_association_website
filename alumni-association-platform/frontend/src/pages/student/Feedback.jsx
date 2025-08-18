import React from 'react';

const Feedback = () => {
  const feedbackCategories = [
    {
      id: 1,
      title: 'General Feedback',
      description: 'Share your thoughts about the platform and overall experience'
    },
    {
      id: 2,
      title: 'Mentorship Program',
      description: 'Feedback about mentorship sessions and mentor quality'
    },
    {
      id: 3,
      title: 'Workshops & Events',
      description: 'Suggestions for improving workshops and events'
    },
    {
      id: 4,
      title: 'Job Portal',
      description: 'Feedback about job opportunities and application process'
    }
  ];

  const myFeedback = [
    {
      id: 1,
      category: 'Mentorship Program',
      message: 'The mentorship session with John Doe was very helpful. He provided great insights about the industry.',
      status: 'Submitted',
      date: '2024-11-15'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and suggestions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Feedback */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback</h2>
            <div className="space-y-4">
              {feedbackCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Submit Feedback
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Feedback */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Feedback</h2>
            <div className="space-y-4">
              {myFeedback.map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.category}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{feedback.message}</p>
                  <div className="text-sm text-gray-500">
                    Submitted on {feedback.date}
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

export default Feedback;
