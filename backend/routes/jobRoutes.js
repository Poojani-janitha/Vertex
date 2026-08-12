const express = require('express');
const {
  createJob,
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
  generateJobQR,
  getAllJobs,
  getJobById
} = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Require authentication for all job routes
router.use(protect);

// Student & Employer accessible routes (must be BEFORE restrictTo middleware!)
router.get('/', getAllJobs);

// Employer creation & QR generation
router.post('/', restrictTo('employer'), createJob);
router.post('/:id/generate-qr', restrictTo('employer'), generateJobQR);

// Dynamic routes last!
router.get('/:id', getJobById);

// Employer-only routes
router.use(restrictTo('employer'));
router.post('/', createJob);
router.get('/my-jobs', getMyJobs);
router.get('/my-jobs/:id/applicants', getJobApplicants);
router.patch('/applications/:applicationId', updateApplicationStatus);
router.post('/:id/generate-qr', generateJobQR);

module.exports = router;
