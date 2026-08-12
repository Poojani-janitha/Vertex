const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.get('/', availabilityController.getAll);
router.get('/:id', availabilityController.getById);
router.post('/', availabilityController.create);
router.put('/:id', availabilityController.update);
router.delete('/:id', availabilityController.delete);

module.exports = router;
