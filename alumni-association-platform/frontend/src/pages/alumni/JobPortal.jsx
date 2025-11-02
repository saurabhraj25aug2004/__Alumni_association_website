import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { jobAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';
import Toast from '../../components/Toast';

const JobPortal = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, jobId: null, jobTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    requirements: '',
    skills: '',
    deadline: ''
  });

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
      const [jobsRes, myJobsRes] = await Promise.all([
        jobAPI.getAllJobs(),
        jobAPI.getMyJobs().catch(() => ({ data: { jobs: [] } }))
      ]);
      setJobs(jobsRes.data?.jobs || jobsRes.data || []);
      setMyJobs(myJobsRes.data?.jobs || myJobsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const jobData = {
        ...formData,
        salary: {
          min: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
          max: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
          currency: formData.currency
        },
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline || undefined
      };
      delete jobData.salaryMin;
      delete jobData.salaryMax;

      if (editingJob) {
        await jobAPI.updateJob(editingJob._id, jobData);
        showToast('Job updated successfully', 'success');
      } else {
        await jobAPI.createJob(jobData);
        showToast('Job posted successfully', 'success');
      }
      
      await loadData();
      setShowJobForm(false);
      setEditingJob(null);
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save job';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'full-time',
      salaryMin: job.salary?.min || '',
      salaryMax: job.salary?.max || '',
      currency: job.salary?.currency || 'USD',
      requirements: job.requirements?.join(', ') || '',
      skills: job.skills?.join(', ') || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ''
    });
    setShowJobForm(true);
  };

  const handleDelete = (jobId, jobTitle) => {
    setDeleteConfirm({ show: true, jobId, jobTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.jobId) return;
    
    try {
      setDeleting(true);
      await jobAPI.deleteJob(deleteConfirm.jobId);
      setDeleteConfirm({ show: false, jobId: null, jobTitle: '' });
      await loadData();
      showToast('Job deleted successfully', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete job';
      showToast(errorMsg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      company: '',
      location: '',
      type: 'full-time',
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      requirements: '',
      skills: '',
      deadline: ''
    });
    setEditingJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || 
      job.company.toLowerCase().includes(filterCompany.toLowerCase());
    return matchesSearch && matchesCompany;
  });

  const filteredMyJobs = myJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || 
      job.company.toLowerCase().includes(filterCompany.toLowerCase());
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Portal</h1>
            <p className="text-gray-600 mt-2">Post job opportunities and manage applications</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowJobForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post New Job
          </button>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'success' })}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this job post?
                  <br />
                  <strong>"{deleteConfirm.jobTitle}"</strong> will be permanently removed.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, jobId: null, jobTitle: '' })}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingJob ? 'Edit Job' : 'Post New Job'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company *
                      </label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type *
                    </label>
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Min
                      </label>
                      <input
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Max
                      </label>
                      <input
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="e.g., 3+ years experience, Bachelor's degree"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., JavaScript, React, Node.js"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
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
                        setShowJobForm(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingJob ? 'Save Changes' : 'Post Job')}
                  </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search jobs by title or description..."
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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* All Job Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Job Listings</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading jobs...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-gray-500 bg-white p-8 rounded-lg shadow text-center">
                  No jobs found
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {job.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Salary:</span>{' '}
                        {job.salary?.min && job.salary?.max 
                          ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency || ''}`
                          : 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Applicants:</span> {job.applicants?.length || 0}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      {(job.postedBy?._id === user?._id || job.postedBy === user?._id) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center gap-1.5 transition-colors"
                            title="Edit job"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job._id, job.title)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-1.5 transition-colors"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Posted Jobs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Posted Jobs</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : filteredMyJobs.length === 0 ? (
                  <div className="text-gray-500">No jobs posted yet</div>
                ) : (
                  filteredMyJobs.map((job) => {
                    const applicantCount = job.applicants?.length || 0;
                    const pendingCount = job.applicants?.filter(a => a.status === 'pending').length || 0;
                    return (
                      <div key={job._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                          <span>{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                          {pendingCount > 0 && (
                            <span className="text-orange-600">{pendingCount} pending</span>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
                            title="Edit job"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job._id, job.title)}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
                            title="Delete job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;
