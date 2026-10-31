const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
  downloadResume,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

// Student: apply and list own applications
router.post('/', protect, authorize('student'), uploadResume.single('resume'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.delete('/:id/withdraw', protect, authorize('student'), withdrawApplication);

// Recruiter / Admin: view applicants and update status
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

// Secure resume download
router.get('/:id/resume', protect, downloadResume);

module.exports = router;
