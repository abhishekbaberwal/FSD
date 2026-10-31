const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are strictly protected for Admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobsAdmin);
router.get('/applications', getAllApplicationsAdmin);

module.exports = router;
