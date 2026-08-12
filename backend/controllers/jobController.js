const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { Job, Application, User, EmployerVerification, Message, sequelize } = require('../models');

// @desc    Create a new job post
// @route   POST /api/jobs
// @access  Private (Employer)
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      skillsNeeded,
      payAmount,
      locationName,
      latitude,
      longitude,
      startTime,
      endTime,
      requiredEmployees
    } = req.body;

    // Validate fields
    if (!title || !payAmount || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide title, pay amount, start time, and end time.' });
    }

    // Verify employer verification status
    const verification = await EmployerVerification.findOne({
      where: { userId: req.user.id }
    });

    if (!verification || verification.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your account is pending verification approval by an administrator before posting jobs.'
      });
    }

    const job = await Job.create({
      employerId: req.user.id,
      title,
      description,
      skillsNeeded,
      payAmount,
      locationName,
      latitude,
      longitude,
      startTime,
      endTime,
      requiredEmployees: requiredEmployees ? parseInt(requiredEmployees) : 1,
      status: 'open'
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({ message: 'Server error during job creation.', error: error.message });
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { employerId: req.user.id },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM applications AS app
              WHERE app.job_id = Job.id
            )`),
            'applicationsCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return res.json(jobs);
  } catch (error) {
    console.error('Get my jobs error:', error);
    return res.status(500).json({ message: 'Server error retrieving jobs.', error: error.message });
  }
};

// @desc    Get all applicants for a specific job
// @route   GET /api/jobs/my-jobs/:id/applicants
// @access  Private (Employer)
const getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Check that job exists and belongs to this employer
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job.' });
    }

    // Retrieve applications with student info
    const applicants = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    return res.json(applicants);
  } catch (error) {
    console.error('Get applicants error:', error);
    return res.status(500).json({ message: 'Server error retrieving applicants.', error: error.message });
  }
};

// @desc    Accept or reject a job applicant
// @route   PATCH /api/jobs/applications/:applicationId
// @access  Private (Employer)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status: accepted or rejected.' });
    }

    // Find application and include job to check ownership
    const application = await Application.findOne({
      where: { id: applicationId },
      include: [{ model: Job, as: 'job' }]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Verify job owner is requesting
    if (application.job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage this application.' });
    }

    // Update status
    application.status = status;
    await application.save();

    // If accepted, decrement requiredEmployees and check if filled
    if (status === 'accepted') {
      const job = application.job;
      if (job.requiredEmployees > 0) {
        job.requiredEmployees = Math.max(0, job.requiredEmployees - 1);
        if (job.requiredEmployees === 0) {
          job.status = 'filled';
        }
        await job.save();
      }
    }

    // Automatically send direct message from employer to the student
    const messageText = status === 'accepted'
      ? `Congratulations! Your application for the job "${application.job.title}" has been approved. Looking forward to working with you!`
      : `Thank you for applying for the job "${application.job.title}". Unfortunately, we have decided to proceed with other candidates at this time.`;

    await Message.create({
      jobId: application.jobId,
      senderId: req.user.id,
      receiverId: application.studentId,
      message: messageText,
      sentAt: new Date()
    });

    // Remove nested job object before returning for clean response
    const responseData = application.toJSON();
    delete responseData.job;

    return res.json(responseData);
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ message: 'Server error during status update.', error: error.message });
  }
};

// @desc    Generate secure QR code for check-in or check-out
// @route   POST /api/jobs/:id/generate-qr
// @access  Private (Employer)
const generateJobQR = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { type } = req.body; // 'check-in' or 'check-out'

    if (!type || !['check-in', 'check-out'].includes(type)) {
      return res.status(400).json({ message: 'Please provide type: check-in or check-out.' });
    }

    // Verify job exists and belongs to employer
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to generate code for this job.' });
    }

    // Generate a secure JWT valid for 10 minutes containing the transaction details
    const qrToken = jwt.sign(
      { jobId: job.id, type },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Convert the token string into a Base64 QR code image DataURI
    const qrCode = await QRCode.toDataURL(qrToken);

    return res.json({
      qrCode,
      qrToken,
      type,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return res.status(500).json({ message: 'Server error generating QR code.', error: error.message });
  }
};

// @desc    Get all open jobs (for students)
// @route   GET /api/jobs
// @access  Private (Student/Employer)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: 'open' },
      order: [['createdAt', 'DESC']]
    });
    return res.json(jobs);
  } catch (error) {
    console.error('Get all jobs error:', error);
    return res.status(500).json({ message: 'Server error retrieving jobs.', error: error.message });
  }
};

// @desc    Get a single job details by ID
// @route   GET /api/jobs/:id
// @access  Private (Student/Employer)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: User, as: 'employer', attributes: ['id', 'name', 'email'] }]
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    return res.json(job);
  } catch (error) {
    console.error('Get job by ID error:', error);
    return res.status(500).json({ message: 'Server error retrieving job details.', error: error.message });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
  generateJobQR,
  getAllJobs,
  getJobById
};
