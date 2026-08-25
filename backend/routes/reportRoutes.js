const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, restrictTo('admin'), reportController.getAll);
router.get('/:id', protect, restrictTo('admin'), reportController.getById);
router.post('/', protect, reportController.create);
router.put('/:id', protect, restrictTo('admin'), reportController.update);
router.delete('/:id', protect, restrictTo('admin'), reportController.delete);

module.exports = router;
