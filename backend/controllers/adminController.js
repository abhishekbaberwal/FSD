const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get system-wide metrics and chart analytics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Open' });
    const totalApplications = await Application.countDocuments();

    // Application status counts
    const statusAgg = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Rejected: 0,
      Selected: 0,
    };
    statusAgg.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Jobs by category
    const categoryStats = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent 5 applications
    const recentApplications = await Application.find()
      .populate('student', 'name email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 jobs
    const recentJobs = await Job.find()
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        statusCounts,
        categoryStats,
        recentApplications,
        recentJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering and search
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot deactivate their own account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account.',
      });
    }

    await user.deleteOne();
    await Job.deleteMany({ postedBy: user._id });
    await Application.deleteMany({ $or: [{ student: user._id }, { recruiter: user._id }] });

    res.status(200).json({
      success: true,
      message: 'User and all related data removed permanently.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs across platform for admin management
// @route   GET /api/admin/jobs
// @access  Private (Admin)
exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { company: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications across platform for admin review
// @route   GET /api/admin/applications
// @access  Private (Admin)
exports.getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('student', 'name email profile')
      .populate('job', 'title company location')
      .populate('recruiter', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      applications,
    });
  } catch (error) {
    next(error);
  }
};
