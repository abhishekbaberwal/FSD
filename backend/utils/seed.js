const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const SavedJob = require('../models/SavedJob');
const PasswordResetToken = require('../models/PasswordResetToken');
const { users, jobs } = require('./seedData');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();
    await SavedJob.deleteMany();
    await PasswordResetToken.deleteMany();

    console.log(' Seeding Users (Admin, Recruiters, Students)...');
    // Using create one by one or Promise.all to trigger pre-save bcrypt hook
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const techNovaRecruiter = createdUsers.find((u) => u.email === 'recruiter@techcorp.com');
    const codeCraftRecruiter = createdUsers.find((u) => u.email === 'sarah@codecraft.io');
    const adityaStudent = createdUsers.find((u) => u.email === 'student@college.edu');
    const priyaStudent = createdUsers.find((u) => u.email === 'priya@college.edu');

    console.log(' Seeding Jobs...');
    const createdJobs = [];
    for (let i = 0; i < jobs.length; i++) {
      const jobData = { ...jobs[i] };
      // Assign postedBy alternating between recruiters
      jobData.postedBy = i % 2 === 0 ? techNovaRecruiter._id : codeCraftRecruiter._id;
      const job = await Job.create(jobData);
      createdJobs.push(job);
    }

    console.log(' Seeding Applications & Notifications for Student...');
    // Aditya applies to Job 0 (Frontend Developer Intern)
    const app1 = await Application.create({
      job: createdJobs[0]._id,
      student: adityaStudent._id,
      recruiter: techNovaRecruiter._id,
      resumeUrl: adityaStudent.profile.resumeUrl,
      resumeOriginalName: adityaStudent.profile.resumeOriginalName,
      coverNote: 'Excited to contribute my React and modern JavaScript skills to TechNova!',
      status: 'Under Review',
      statusHistory: [
        { status: 'Applied', changedAt: new Date(Date.now() - 3 * 86400000), note: 'Submitted application' },
        { status: 'Under Review', changedAt: new Date(Date.now() - 1 * 86400000), note: 'Candidate profile reviewed by technical team' },
      ],
    });
    await Job.findByIdAndUpdate(createdJobs[0]._id, { $inc: { applicantsCount: 1 } });

    // Aditya applies to Job 1 (Software Engineer)
    const app2 = await Application.create({
      job: createdJobs[1]._id,
      student: adityaStudent._id,
      recruiter: codeCraftRecruiter._id,
      resumeUrl: adityaStudent.profile.resumeUrl,
      resumeOriginalName: adityaStudent.profile.resumeOriginalName,
      coverNote: 'Strong foundation in Java and Data Structures. Eager to solve real engineering problems.',
      status: 'Shortlisted',
      statusHistory: [
        { status: 'Applied', changedAt: new Date(Date.now() - 5 * 86400000), note: 'Submitted application' },
        { status: 'Under Review', changedAt: new Date(Date.now() - 3 * 86400000), note: 'Profile passed screening' },
        { status: 'Shortlisted', changedAt: new Date(Date.now() - 86400000), note: 'Selected for Technical Interview round' },
      ],
    });
    await Job.findByIdAndUpdate(createdJobs[1]._id, { $inc: { applicantsCount: 1 } });

    // Priya applies to Job 2 (Data Analyst Intern)
    await Application.create({
      job: createdJobs[2]._id,
      student: priyaStudent._id,
      recruiter: techNovaRecruiter._id,
      resumeUrl: priyaStudent.profile.resumeUrl,
      resumeOriginalName: priyaStudent.profile.resumeOriginalName,
      coverNote: 'Passionate about data analytics and business intelligence.',
      status: 'Applied',
      statusHistory: [
        { status: 'Applied', changedAt: new Date(), note: 'Application received' },
      ],
    });
    await Job.findByIdAndUpdate(createdJobs[2]._id, { $inc: { applicantsCount: 1 } });

    // Aditya saves Job 6 (Backend Developer)
    await SavedJob.create({
      student: adityaStudent._id,
      job: createdJobs[6]._id,
    });

    // Seed realistic notifications for Aditya
    await Notification.create({
      recipient: adityaStudent._id,
      sender: codeCraftRecruiter._id,
      type: 'APPLICATION_STATUS',
      title: 'Application Shortlisted!',
      message: 'Congratulations! Your application for "Software Engineer (Fresher)" has been shortlisted for technical interview.',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: adityaStudent._id,
      sender: techNovaRecruiter._id,
      type: 'APPLICATION_STATUS',
      title: 'Application Status: Under Review',
      message: 'Your application for "Frontend Developer Intern" is currently being evaluated by the hiring manager.',
      link: '/student/applications',
    });

    // Seed notification for Recruiter
    await Notification.create({
      recipient: techNovaRecruiter._id,
      sender: adityaStudent._id,
      type: 'NEW_APPLICATION',
      title: 'New Applicant Received!',
      message: `${adityaStudent.name} applied for "Frontend Developer Intern"`,
      link: `/recruiter/jobs/${createdJobs[0]._id}/applicants`,
    });

    console.log(' Database successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS READY FOR VIVA & DEMONSTRATION:');
    console.log(' Admin:     admin@smartjobs.com     / Admin@123');
    console.log(' Recruiter: recruiter@techcorp.com  / Recruiter@123');
    console.log(' Student:   student@college.edu     / Student@123');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
