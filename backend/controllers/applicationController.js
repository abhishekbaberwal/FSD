const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverNote } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This job posting has been closed and is no longer accepting applications.',
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this job posting.',
      });
    }

    // Determine resume: either uploaded with request or taken from user profile
    let resumeUrl = '';
    let resumeOriginalName = '';

    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      resumeOriginalName = req.file.originalname;

      // Also update student's profile resume if not set yet
      if (!req.user.profile?.resumeUrl) {
        await User.findByIdAndUpdate(req.user._id, {
          'profile.resumeUrl': resumeUrl,
          'profile.resumeOriginalName': resumeOriginalName,
          'profile.resumeUpdatedAt': new Date(),
        });
      }
    } else if (req.user.profile?.resumeUrl) {
      resumeUrl = req.user.profile.resumeUrl;
      resumeOriginalName = req.user.profile.resumeOriginalName || 'profile_resume.pdf';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please attach a resume file or upload one to your student profile first.',
      });
    }

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      recruiter: job.postedBy,
      resumeUrl,
      resumeOriginalName,
      coverNote: coverNote ? coverNote.trim() : '',
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: new Date(),
          note: 'Application submitted successfully by candidate',
        },
      ],
    });

    // Increment applicants counter on Job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    // Notify Recruiter
    await Notification.create({
      recipient: job.postedBy,
      sender: req.user._id,
      type: 'NEW_APPLICATION',
      title: 'New Applicant Received!',
      message: `${req.user.name} applied for "${job.title}"`,
      link: `/recruiter/jobs/${job._id}/applicants`,
    });

    res.status(201).json({
      success: true,
      message: 'Your application has been successfully submitted!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student applications
// @route   GET /api/applications/my
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title company companyLogo location type salary status category')
      .populate('recruiter', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter who posted job, or Admin)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applicants for this job.',
      });
    }

    const { status } = req.query;
    const filter = { job: jobId };
    if (status && status !== 'All') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('student', 'name email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      company: job.company,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter who posted the job, or Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (
      application.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this application status.',
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note ? note.trim() : `Status updated to ${status}`,
    });

    await application.save();

    // Notify Student
    await Notification.create({
      recipient: application.student._id,
      sender: req.user._id,
      type: 'APPLICATION_STATUS',
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.job?.title}" at ${application.job?.company} is now marked as "${status}".${note ? ` Note: "${note}"` : ''}`,
      link: '/student/applications',
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to "${status}"`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id/withdraw
// @access  Private (Student)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.',
      });
    }

    if (['Selected', 'Rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that has already been finalized as ${application.status}.`,
      });
    }

    const jobId = application.job;
    await application.deleteOne();
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Application has been successfully withdrawn.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Stream uploaded resume securely
// @route   GET /api/applications/:id/resume
// @access  Private (Student owner, Recruiter of job, or Admin)
exports.downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const isStudent = application.student.toString() === req.user._id.toString();
    const isRecruiter = application.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this applicant resume.',
      });
    }

    const relativePath = application.resumeUrl.replace(/^\/+/, '');
    const filePath = path.resolve(__dirname, '..', relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file could not be located on the server.',
      });
    }

    res.download(filePath, application.resumeOriginalName || 'resume.pdf');
  } catch (error) {
    next(error);
  }
};
