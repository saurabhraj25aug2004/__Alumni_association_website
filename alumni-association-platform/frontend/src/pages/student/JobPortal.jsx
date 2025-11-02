import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const JobPortal = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => loadData();
      socketService.onEntityCreated('jobs', refresh);
      socketService.onEntityUpdated('jobs', refresh);
      socketService.onEntityDeleted('jobs', refresh);
      return () => {
        socketService.removeListener('jobs:created');
        socketService.removeListener('jobs:updated');
        socketService.removeListener('jobs:deleted');
      };
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getAllJobs(),
        jobAPI.getMyApplications().catch(() => ({ data: { applications: [] } }))
      ]);
      setJobs(jobsRes.data?.jobs || jobsRes.data || []);
      setMyApplications(appsRes.data?.applications || appsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleApply = async (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setUploading(true);
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }

      await jobAPI.applyForJob(selectedJob._id, formData);
      await loadData();
      setShowApplyModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      setResumeFile(null);
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setUploading(false);
    }
  };

  const hasApplied = (jobId) => {
    return myApplications.some(app => app._id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = myApplications.find(app => app._id === jobId);
    return application?.applicationStatus || 'pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-200 text-green-900'
    };
    return colors[status] || colors.pending;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || 
      job.company.toLowerCase().includes(filterCompany.toLowerCase());
    const matchesType = !filterType || job.type === filterType;
    return matchesSearch && matchesCompany && matchesType;
  });

  const appliedJobs = myApplications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || 
      app.company?.toLowerCase().includes(filterCompany.toLowerCase());
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Portal</h1>
          <p className="text-gray-600 mt-2">Find internship and job opportunities</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Filter by company..."
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Application Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Apply for {selectedJob.title}
                  </h2>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedJob(null);
                      setCoverLetter('');
                      setResumeFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Resume (PDF/DOC/DOCX) *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder="Write a cover letter explaining why you're a good fit for this position..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplyModal(false);
                        setSelectedJob(null);
                        setCoverLetter('');
                        setResumeFile(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !resumeFile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Positions</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading jobs...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-gray-500 bg-white p-8 rounded-lg shadow text-center">
                  No jobs found
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const applied = hasApplied(job._id);
                  const status = getApplicationStatus(job._id);
                  return (
                    <div key={job._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                          >
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {job.type}
                          </span>
                          {applied && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Location:</span> {job.location}
                        </div>
                        <div>
                          <span className="font-medium">Salary:</span>{' '}
                          {job.salary?.min && job.salary?.max 
                            ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency || ''}`
                            : 'Not specified'}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Posted by {job.postedBy?.name || 'Unknown'} on {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => applied ? navigate(`/jobs/${job._id}`) : handleApply(job._id)}
                          disabled={applied}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            applied
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {applied ? 'Already Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* My Applications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Applications</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500">Loading applications...</div>
                ) : appliedJobs.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No applications yet</div>
                ) : (
                  appliedJobs.map((application) => {
                    const status = application.applicationStatus || 'pending';
                    const appliedDate = application.appliedAt 
                      ? new Date(application.appliedAt).toLocaleDateString()
                      : new Date(application.createdAt).toLocaleDateString();
                    
                    return (
                      <div key={application._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 
                              onClick={() => navigate(`/jobs/${application._id}`)}
                              className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600"
                            >
                              {application.title}
                            </h3>
                            <p className="text-sm text-gray-600">{application.company}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Applied {appliedDate}
                          </span>
                          <button
                            onClick={() => navigate(`/jobs/${application._id}`)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Application Stats */}
            {appliedJobs.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Applications:</span>
                    <span className="font-semibold">{appliedJobs.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold text-yellow-600">
                      {appliedJobs.filter(app => app.applicationStatus === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shortlisted:</span>
                    <span className="font-semibold text-purple-600">
                      {appliedJobs.filter(app => app.applicationStatus === 'shortlisted').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accepted:</span>
                    <span className="font-semibold text-green-600">
                      {appliedJobs.filter(app => app.applicationStatus === 'accepted' || app.applicationStatus === 'hired').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;
