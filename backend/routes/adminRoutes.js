const express = require('express');
const {
  getPendingEmployers,
  verifyEmployer,
  deleteReview,
  deleteJob,
  getAllReports,
  updateReportStatus,
  getAllStudents,
  deleteStudent,
  getStudentHistory,
  getAllEmergencies,
  resolveEmergency
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Require authenticated users with the 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

// Employer Verification
router.get('/employers/pending', getPendingEmployers);
router.patch('/employers/:userId/verify', verifyEmployer);

// Moderation
router.delete('/reviews/:id', deleteReview);
router.delete('/jobs/:id', deleteJob);

// Reports
router.get('/reports', getAllReports);
router.patch('/reports/:id', updateReportStatus);

// Student Management
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.get('/students/:id/history', getStudentHistory);

// Emergencies
router.get('/emergencies', getAllEmergencies);
router.patch('/emergencies/:id/resolve', resolveEmergency);

module.exports = router;
