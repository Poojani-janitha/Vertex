const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);
router.post('/', protect, reviewController.create);
router.put('/:id', protect, reviewController.update);
router.delete('/:id', protect, restrictTo('admin'), reviewController.delete);

module.exports = router;
