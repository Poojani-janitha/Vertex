const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, messageController.getAll);
router.get('/:id', protect, messageController.getById);
router.post('/', protect, messageController.create);
router.put('/:id', protect, messageController.update);
router.delete('/:id', protect, restrictTo('admin'), messageController.delete);

module.exports = router;
