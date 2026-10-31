const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required to apply'],
    },
    resumeOriginalName: {
      type: String,
      default: 'resume.pdf',
    },
    coverNote: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
      default: 'Applied',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1 });
applicationSchema.index({ recruiter: 1 });
applicationSchema.index({ job: 1 });

module.exports = mongoose.model('Application', applicationSchema);
