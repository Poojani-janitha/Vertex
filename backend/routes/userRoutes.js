const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, restrictTo('admin'), userController.getAll);
router.get('/:id', userController.getById);
router.get('/:id/trust-score', userController.getTrustScore);
router.post('/', protect, restrictTo('admin'), userController.create);
router.put('/:id', protect, userController.update);
router.delete('/:id', protect, userController.delete);

module.exports = router;
