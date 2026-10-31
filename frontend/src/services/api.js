import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartjobs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';

    // If 401 Unauthorized (and not checking /me or logging in), optionally clean stale session
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      if (localStorage.getItem('smartjobs_token')) {
        localStorage.removeItem('smartjobs_token');
        localStorage.removeItem('smartjobs_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/recruiter/my-jobs'),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getCategories: () => api.get('/jobs/categories'),
  toggleSaveJob: (id) => api.post(`/jobs/${id}/save`),
  getSavedJobs: () => api.get('/jobs/saved/all'),
};

export const applicationsAPI = {
  applyForJob: (formData) =>
    api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyApplications: () => api.get('/applications/my'),
  getJobApplicants: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdrawApplication: (id) => api.delete(`/applications/${id}/withdraw`),
  downloadResume: (applicationId) =>
    api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' }),
};

export const usersAPI = {
  updateStudentProfile: (data) => api.put('/users/profile', data),
  uploadResume: (formData) =>
    api.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCompanyProfile: (data) => api.put('/users/company', data),
  getStudentProfile: (id) => api.get(`/users/profile/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  getAllApplications: (params) => api.get('/admin/applications', { params }),
};

export const notificationsAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
