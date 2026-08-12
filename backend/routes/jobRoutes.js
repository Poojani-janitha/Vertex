const express = require('express');
const {
  createJob,
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
  generateJobQR
} = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here require being authenticated and having the 'employer' role
router.use(protect);
router.use(restrictTo('employer'));

router.post('/', createJob);
router.get('/my-jobs', getMyJobs);
router.get('/my-jobs/:id/applicants', getJobApplicants);
router.patch('/applications/:applicationId', updateApplicationStatus);
router.post('/:id/generate-qr', generateJobQR);

module.exports = router;
