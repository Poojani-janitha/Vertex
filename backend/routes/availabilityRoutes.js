const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-availability', protect, availabilityController.getMyAvailability);
router.put('/my-availability', protect, availabilityController.updateMyAvailability);

router.get('/', availabilityController.getAll);
router.get('/:id', availabilityController.getById);
router.post('/', availabilityController.create);
router.put('/:id', availabilityController.update);
router.delete('/:id', availabilityController.delete);

module.exports = router;
