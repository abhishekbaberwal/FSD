const User = require('../models/User');

// @desc    Update student profile details
// @route   PUT /api/users/profile
// @access  Private (Student)
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const {
      name,
      headline,
      bio,
      phone,
      location,
      education,
      skills,
      experience,
      projects,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (!user.profile) user.profile = {};

    if (headline !== undefined) user.profile.headline = headline;
    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (location !== undefined) user.profile.location = location;

    if (education !== undefined) {
      user.profile.education = Array.isArray(education) ? education : [];
    }

    if (skills !== undefined) {
      user.profile.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (experience !== undefined) {
      user.profile.experience = Array.isArray(experience) ? experience : [];
    }

    if (projects !== undefined) {
      user.profile.projects = Array.isArray(projects) ? projects : [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student resume to profile
// @route   POST /api/users/resume
// @access  Private (Student)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume file to upload.' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeOriginalName = req.file.originalname;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.resumeUrl': resumeUrl,
        'profile.resumeOriginalName': resumeOriginalName,
        'profile.resumeUpdatedAt': new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resumeUrl,
      resumeOriginalName,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.avatar': avatarUrl,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully!',
      avatarUrl,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruiter company profile
// @route   PUT /api/users/company
// @access  Private (Recruiter)
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const { name, logo, website, description, industry, location, size } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.company) user.company = {};

    if (name !== undefined) user.company.name = name;
    if (logo !== undefined) user.company.logo = logo;
    if (website !== undefined) user.company.website = website;
    if (description !== undefined) user.company.description = description;
    if (industry !== undefined) user.company.industry = industry;
    if (location !== undefined) user.company.location = location;
    if (size !== undefined) user.company.size = size;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Company details updated successfully!',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View candidate profile
// @route   GET /api/users/profile/:id
// @access  Private (Recruiter or Admin)
exports.getStudentProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.status(200).json({
      success: true,
      profile: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
