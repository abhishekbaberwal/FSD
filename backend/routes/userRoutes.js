const express = require('express');
const router = express.Router();
const {
  updateStudentProfile,
  uploadResume,
  uploadAvatar,
  updateCompanyProfile,
  getStudentProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume: multerResume, uploadAvatar: multerAvatar } = require('../middleware/upload');

// Student profile endpoints
router.put('/profile', protect, authorize('student'), updateStudentProfile);
router.post('/resume', protect, authorize('student'), multerResume.single('resume'), uploadResume);

// Shared avatar upload
router.post('/avatar', protect, multerAvatar.single('avatar'), uploadAvatar);

// Recruiter company profile
router.put('/company', protect, authorize('recruiter'), updateCompanyProfile);

// View candidate profile (recruiter / admin)
router.get('/profile/:id', protect, authorize('recruiter', 'admin'), getStudentProfile);

module.exports = router;
