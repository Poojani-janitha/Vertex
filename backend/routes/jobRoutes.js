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

// Static employer-only routes first (to prevent conflict with :id)
router.get('/my-jobs', restrictTo('employer'), getMyJobs);
router.get('/my-jobs/:id/applicants', restrictTo('employer'), getJobApplicants);
router.patch('/applications/:applicationId', restrictTo('employer'), updateApplicationStatus);

// General static routes
router.get('/', getAllJobs);

// Employer creation & QR generation
router.post('/', restrictTo('employer'), createJob);
router.post('/:id/generate-qr', restrictTo('employer'), generateJobQR);

// Dynamic routes last!
router.get('/:id', getJobById);

module.exports = router;
