const express = require('express');
const {
  createJob,
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
  generateJobQR,
  scanStudentQR,
  getStudentCheckinQR,
  getAllJobs,
  getJobById
} = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Public static routes (No login required)
router.get('/', getAllJobs);

// 2. Protected Employer-only routes (static routes must be BEFORE dynamic parameter routes!)
router.get('/my-jobs', protect, restrictTo('employer'), getMyJobs);
router.get('/my-jobs/:id/applicants', protect, restrictTo('employer'), getJobApplicants);
router.patch('/applications/:applicationId', protect, restrictTo('employer'), updateApplicationStatus);
router.post('/checkin/scan', protect, restrictTo('employer'), scanStudentQR);
router.post('/:id/generate-qr', protect, restrictTo('employer'), generateJobQR);
router.post('/', protect, restrictTo('employer'), createJob);

// 3. Protected Student-only route
router.get('/applications/:applicationId/qr', protect, getStudentCheckinQR);

// 4. Public dynamic routes (Must be at the very bottom so it doesn't hijack /my-jobs)
router.get('/:id', getJobById);

module.exports = router;
