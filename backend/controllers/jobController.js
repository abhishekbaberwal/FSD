const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// @desc    Get all jobs with search, filtering, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      type,
      location,
      experience,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'Open' };

    // Search query on title, company, description, or skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (experience && experience !== 'All') {
      // Normalize dash characters to handle "0-1 Years"
      query.experience = new RegExp(`^${experience.replace('-', '[-–—]')}$`, 'i');
    }

    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'title') sortOptions = { title: 1 };

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / limitNumber),
      currentPage: pageNumber,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (with optional user context)
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let hasApplied = false;
    let isSaved = false;

    if (req.user) {
      const existingApplication = await Application.findOne({
        job: job._id,
        student: req.user._id,
      });
      hasApplied = !!existingApplication;

      const saved = await SavedJob.findOne({
        job: job._id,
        student: req.user._id,
      });
      isSaved = !!saved;
    }

    res.status(200).json({
      success: true,
      job,
      hasApplied,
      isSaved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter / Admin)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyLogo,
      location,
      type,
      salary,
      experience,
      category,
      skills,
      description,
      responsibilities,
      requirements,
      deadline,
    } = req.body;

    if (!title || !company || !location || !salary || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required job fields.',
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      companyLogo: companyLogo || req.user.company?.logo || '',
      location: location.trim(),
      type: type || 'Full-time',
      salary: salary.trim(),
      experience: experience || 'Fresher',
      category: category || 'Software Development',
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      description: description.trim(),
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : typeof responsibilities === 'string'
        ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      requirements: Array.isArray(requirements)
        ? requirements
        : typeof requirements === 'string'
        ? requirements.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      postedBy: req.user._id,
      deadline: deadline || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter who posted the job, or Admin)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Authorization check
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job posting.',
      });
    }

    const updates = { ...req.body };
    if (typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof updates.responsibilities === 'string') {
      updates.responsibilities = updates.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof updates.requirements === 'string') {
      updates.requirements = updates.requirements.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter who posted the job, or Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job posting.',
      });
    }

    await job.deleteOne();
    await Application.deleteMany({ job: job._id });
    await SavedJob.deleteMany({ job: job._id });

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's posted jobs
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
exports.getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'Open' })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(6);
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories summary with job count
// @route   GET /api/jobs/categories
// @access  Public
exports.getJobCategories = async (req, res, next) => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'Open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark job
// @route   POST /api/jobs/:id/save
// @access  Private (Student)
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const existing = await SavedJob.findOne({ student: req.user._id, job: jobId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Job removed from saved jobs.',
      });
    }

    await SavedJob.create({ student: req.user._id, job: jobId });
    res.status(200).json({
      success: true,
      isSaved: true,
      message: 'Job bookmarked to your saved list!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current student
// @route   GET /api/jobs/saved/all
// @access  Private (Student)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ student: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    const jobs = saved.filter((s) => s.job).map((s) => s.job);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};
