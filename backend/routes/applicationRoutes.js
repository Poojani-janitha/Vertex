const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/my-applications', protect, applicationController.getMyApplications);
router.post('/', protect, restrictTo('student'), applicationController.create);
router.get('/', protect, restrictTo('admin'), applicationController.getAll);
router.get('/:id', protect, applicationController.getById);
router.put('/:id', protect, applicationController.update);
router.delete('/:id', protect, applicationController.delete);

module.exports = router;
