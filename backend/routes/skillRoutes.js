const express = require('express');
const { getAllSkills } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllSkills);

module.exports = router;
