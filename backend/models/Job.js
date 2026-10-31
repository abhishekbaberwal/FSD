const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-time', 'Internship', 'Part-time', 'Remote', 'Contract'],
      default: 'Full-time',
    },
    salary: {
      type: String,
      required: [true, 'Salary or stipend is required'],
      trim: true,
    },
    experience: {
      type: String,
      enum: ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'],
      default: 'Fresher',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Software Development',
        'Data Science',
        'UI/UX Design',
        'Cyber Security',
        'Digital Marketing',
        'Mobile App Development',
        'Cloud & DevOps',
        'Other',
      ],
      default: 'Software Development',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for live search & filtering performance
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ category: 1, type: 1, location: 1, experience: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
