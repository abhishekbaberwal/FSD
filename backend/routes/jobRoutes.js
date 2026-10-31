const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getFeaturedJobs,
  getJobCategories,
  toggleSaveJob,
  getSavedJobs,
} = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getJobCategories);

// Student saved jobs
router.get('/saved/all', protect, authorize('student'), getSavedJobs);
router.post('/:id/save', protect, authorize('student'), toggleSaveJob);

// Recruiter jobs
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);

// Job by ID (optionalAuth attaches user to check if applied or saved)
router.get('/:id', optionalAuth, getJobById);

// Manage jobs (recruiter & admin)
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
