const express = require('express');
const { createEmergency } = require('../controllers/emergencyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, restrictTo('student'), createEmergency);

module.exports = router;
