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

// Student & Employer accessible routes (Public, no login required to view)
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Require authentication for all other actions (post, manage applications, QR)
router.use(protect);

// Employer-only routes
router.use(restrictTo('employer'));
router.post('/', createJob);
router.get('/my-jobs', getMyJobs);
router.get('/my-jobs/:id/applicants', getJobApplicants);
router.patch('/applications/:applicationId', updateApplicationStatus);
router.post('/:id/generate-qr', generateJobQR);

module.exports = router;
